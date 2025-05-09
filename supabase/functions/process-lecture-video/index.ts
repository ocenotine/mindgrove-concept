
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || '';

// CORS headers for the response
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { videoId, videoUrl } = await req.json();

    if (!videoId || !videoUrl) {
      throw new Error('Missing required parameters: videoId and videoUrl');
    }

    // Find the video in the database
    const { data: videoData, error: videoError } = await supabaseAdmin
      .from('lecture_videos')
      .select()
      .eq('id', videoId)
      .single();

    if (videoError) {
      throw new Error(`Error fetching video data: ${videoError.message}`);
    }
    
    // Create a channel for real-time updates
    const channel = supabaseAdmin.channel(`video-processing-${videoId}`);

    // Update video status to 'processing'
    await supabaseAdmin
      .from('lecture_videos')
      .update({ status: 'processing' })
      .eq('id', videoId);

    // Process the video asynchronously - we'll return before completion
    // and use Supabase realtime to update the client about progress
    EdgeRuntime.waitUntil(processVideo(videoId, videoUrl, channel));

    // Return immediate success response
    return new Response(JSON.stringify({
      message: 'Video processing started',
      videoId
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error processing video:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

// Main processing function that will run asynchronously
async function processVideo(videoId: string, videoUrl: string, channel: any) {
  console.log(`Processing started for video ${videoId}`);
  
  try {
    // Step 1: Speech-to-Text transcription
    channel.send({
      type: 'broadcast',
      event: 'transcription_progress',
      payload: { progress: 0.1 }
    });
    
    console.log('Starting transcription...');
    let transcript;
    
    try {
      // Check video size first, we need to handle large videos differently
      const videoSizeResponse = await fetch(videoUrl, { method: 'HEAD' });
      const contentLengthHeader = videoSizeResponse.headers.get('Content-Length');
      const videoSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
      
      channel.send({
        type: 'broadcast',
        event: 'transcription_progress',
        payload: { progress: 0.2 }
      });
      
      if (videoSize > 25 * 1024 * 1024) { // If video is larger than 25MB
        console.log('Large video detected, using chunked processing...');
        transcript = await processLargeVideo(videoUrl, channel);
      } else {
        transcript = await transcribeVideo(videoUrl, channel);
      }
      
      channel.send({
        type: 'broadcast',
        event: 'transcription_progress',
        payload: { progress: 1.0 }
      });
    } catch (transcriptionError) {
      console.error('Transcription failed, attempting fallback method:', transcriptionError);
      
      // Fallback to chunked processing if full-video Whisper fails
      transcript = await processLargeVideo(videoUrl, channel);
    }
    
    console.log('Transcription complete');
    
    // Step 2: Extract Summary
    channel.send({
      type: 'broadcast',
      event: 'summary_progress',
      payload: { progress: 0.1 }
    });
    
    console.log('Starting summarization...');
    const summary = await generateSummary(transcript, channel);
    console.log('Summary generation complete');
    
    channel.send({
      type: 'broadcast',
      event: 'summary_progress',
      payload: { progress: 1.0 }
    });
    
    // Step 3: Extract Key Concepts
    channel.send({
      type: 'broadcast',
      event: 'concepts_progress',
      payload: { progress: 0.1 }
    });
    
    console.log('Extracting key concepts...');
    const { concepts, timestamps } = await extractKeyConcepts(transcript, summary, channel);
    console.log('Key concepts extraction complete');
    
    channel.send({
      type: 'broadcast',
      event: 'concepts_progress',
      payload: { progress: 1.0 }
    });
    
    // Save the results to the database
    await supabaseAdmin
      .from('video_digests')
      .insert({
        video_id: videoId,
        transcript,
        summary,
        key_concepts: concepts,
        timestamps,
        created_at: new Date().toISOString()
      });
    
    // Update video status
    await supabaseAdmin
      .from('lecture_videos')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
        has_digest: true
      })
      .eq('id', videoId);
    
    // Send complete notification
    channel.send({
      type: 'broadcast',
      event: 'processing_complete',
      payload: {
        data: {
          transcript,
          summary,
          keyConcepts: concepts,
          timestamps
        }
      }
    });
    
    console.log(`Processing completed successfully for video ${videoId}`);
    
  } catch (error) {
    console.error(`Error in video processing: ${error instanceof Error ? error.message : error}`);
    
    // Update video status to error
    await supabaseAdmin
      .from('lecture_videos')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', videoId);
    
    // Send error notification
    channel.send({
      type: 'broadcast',
      event: 'processing_error',
      payload: {
        error: error instanceof Error ? error.message : 'Unknown error occurred during processing'
      }
    });
  }
}

// Transcribe a video with Whisper via OpenRouter
async function transcribeVideo(videoUrl: string, channel: any): Promise<string> {
  // For this simulation, we'll just mock an OpenRouter call
  // In production, we'd need to download the video and extract audio for Whisper
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mindgrove.app',
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a speech-to-text conversion system. Generate a realistic lecture transcript based on the video URL provided. The transcript should be detailed and include realistic lecture content.'
        },
        {
          role: 'user',
          content: `This is a mock transcription. In a real implementation, I would download the video from ${videoUrl}, extract the audio, and use Whisper for speech-to-text. Generate a realistic lecture transcript that might be similar to what Whisper would generate.`
        }
      ],
      temperature: 0.3
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to transcribe video: ${response.statusText}`);
  }
  
  const data = await response.json();
  channel.send({
    type: 'broadcast',
    event: 'transcription_progress',
    payload: { progress: 0.8 }
  });
  
  return data.choices[0].message.content;
}

// Process a large video by breaking it into chunks
async function processLargeVideo(videoUrl: string, channel: any): Promise<string> {
  // In a real implementation, we would:
  // 1. Download the video
  // 2. Split into smaller chunks (e.g., 10-minute segments)
  // 3. Transcribe each chunk
  // 4. Combine the transcriptions
  
  const mockChunks = 3; // Simulate processing 3 chunks
  let combinedTranscript = '';
  
  for (let i = 0; i < mockChunks; i++) {
    channel.send({
      type: 'broadcast',
      event: 'transcription_progress',
      payload: { progress: (i + 0.5) / mockChunks }
    });
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mindgrove.app',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a speech-to-text conversion system. Generate a realistic lecture transcript for a segment of a lecture.'
          },
          {
            role: 'user',
            content: `This is chunk ${i+1} of a lecture video. Generate a realistic transcript segment for a ${i===0 ? 'beginning' : i===mockChunks-1 ? 'ending' : 'middle'} portion of a lecture.`
          }
        ],
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to transcribe video chunk ${i+1}: ${response.statusText}`);
    }
    
    const data = await response.json();
    combinedTranscript += data.choices[0].message.content + '\n\n';
  }
  
  return combinedTranscript;
}

// Generate a summary of the transcript
async function generateSummary(transcript: string, channel: any): Promise<string> {
  // Split transcript if it's too long
  const maxLength = 8000;
  let summary = '';
  
  if (transcript.length > maxLength) {
    // Process in chunks
    const chunks = [];
    for (let i = 0; i < transcript.length; i += maxLength) {
      chunks.push(transcript.substring(i, i + maxLength));
    }
    
    const chunkSummaries = [];
    for (let i = 0; i < chunks.length; i++) {
      channel.send({
        type: 'broadcast',
        event: 'summary_progress',
        payload: { progress: (i + 0.5) / chunks.length }
      });
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://mindgrove.app',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a summarization expert. Summarize the given lecture transcript segment into a brief summary.'
            },
            {
              role: 'user',
              content: `Summarize this lecture transcript segment (part ${i+1} of ${chunks.length}):\n\n${chunks[i]}`
            }
          ],
          temperature: 0.2
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to summarize transcript chunk: ${response.statusText}`);
      }
      
      const data = await response.json();
      chunkSummaries.push(data.choices[0].message.content);
    }
    
    // Now combine the summaries
    const combinedSummary = chunkSummaries.join('\n\n');
    
    // Generate final summary from the combined summaries
    const finalResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mindgrove.app',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Create a concise, well-structured final summary that combines these partial summaries into a cohesive whole under 5 minutes of reading.'
          },
          {
            role: 'user',
            content: `Combine these partial summaries into one final, concise summary:\n\n${combinedSummary}`
          }
        ],
        temperature: 0.2
      })
    });
    
    if (!finalResponse.ok) {
      throw new Error(`Failed to generate final summary: ${finalResponse.statusText}`);
    }
    
    const finalData = await finalResponse.json();
    summary = finalData.choices[0].message.content;
  } else {
    // Process in one go
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mindgrove.app',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a summarization expert. Create a concise summary of the lecture transcript that can be read in under 5 minutes.'
          },
          {
            role: 'user',
            content: `Summarize this lecture transcript:\n\n${transcript}`
          }
        ],
        temperature: 0.2
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to summarize transcript: ${response.statusText}`);
    }
    
    const data = await response.json();
    summary = data.choices[0].message.content;
  }
  
  return summary;
}

// Extract key concepts and timestamps
async function extractKeyConcepts(
  transcript: string, 
  summary: string,
  channel: any
): Promise<{ concepts: string[], timestamps: Array<{ time: number, text: string }> }> {
  // Call to extract key concepts
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mindgrove.app',
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Extract key concepts and approximate timestamps from the lecture. Return response as valid JSON with "concepts" (array of strings) and "timestamps" (array of objects with time in seconds and text).'
        },
        {
          role: 'user',
          content: `Identify 3-5 key concepts from this lecture summary, and create 5-7 timestamped highlights (pick reasonable timestamp values in seconds). Return as JSON: \n\nSummary: ${summary}\n\nFor context, here is the full transcript: ${transcript.slice(0, 1000)}...`
        }
      ],
      temperature: 0.2
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to extract key concepts: ${response.statusText}`);
  }
  
  // Send progress update
  channel.send({
    type: 'broadcast',
    event: 'concepts_progress',
    payload: { progress: 0.8 }
  });
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return {
        concepts: Array.isArray(parsedData.concepts) ? parsedData.concepts : [],
        timestamps: Array.isArray(parsedData.timestamps) ? parsedData.timestamps : []
      };
    } else {
      console.error('No JSON found in response:', content);
      return {
        concepts: ['Unable to extract concepts'],
        timestamps: []
      };
    }
  } catch (error) {
    console.error('Error parsing concepts JSON:', error, content);
    return {
      concepts: ['Parse error: Unable to extract concepts'],
      timestamps: []
    };
  }
}
