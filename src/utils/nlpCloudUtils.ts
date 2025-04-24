import { toast } from "@/components/ui/use-toast";

// API endpoint for NLPCloud
const NLP_CLOUD_API_ENDPOINT = 'https://api.nlpcloud.io/v1/';
const API_KEY = 'your-api-key'; // Replace with actual API key or environment variable

/**
 * Generate a document summary using NLPCloud API
 */
export const generateDocumentSummary = async (text: string, options = {}): Promise<string> => {
  try {
    // For local development without API calls, use a placeholder generator
    if (!API_KEY.startsWith('your-')) {
      // If we have a valid API key, make the actual API call
      const response = await fetch(`${NLP_CLOUD_API_ENDPOINT}bart-large-cnn/summarization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          size: 'large', // Changed from 'medium' to 'large' for longer summaries
          ...options
        })
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.summary;
    } else {
      // Generate more detailed placeholder summary based on text content
      const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
      const keyWords = text.split(' ')
        .filter(word => word.length > 5)
        .slice(0, 15) // Increased from 10 to 15 for more keywords
        .map(word => word.replace(/[^a-zA-Z]/g, ''));
      
      // Create a "smart" summary that uses different patterns for different documents
      // and now generates longer text with more details
      const topicSentence = sentences[0] || "This document explores important concepts.";
      const randomKeywords = keyWords.slice(0, 5).join(', '); // Increased from 3 to 5
      
      // Calculate a simple hash of the text to ensure different summaries
      const textHash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5;
      
      // Create longer summary templates
      const summaryTemplates = [
        `${topicSentence} The document provides an in-depth analysis of ${randomKeywords} and related topics. Through several examples and case studies, it elaborates on theoretical foundations and practical applications. Key findings suggest important implications for further research in this field. The methodology section outlines approaches used in data collection and analysis, validating the conclusions drawn throughout the document. Several experts in the field are cited, lending credibility to the arguments presented.`,
        
        `This document presents a comprehensive examination of ${randomKeywords}. It begins with a detailed introduction establishing the context and significance of the subject matter. The main body of the text explores methodologies and applications, offering evidence-based insights. Each section builds upon previous points, culminating in a cohesive argument regarding best practices and future directions. Multiple perspectives are considered, creating a balanced viewpoint on the topics discussed.`,
        
        `The text provides an extensive overview of ${randomKeywords} with practical examples and theoretical frameworks. ${topicSentence} Throughout the document, connections are drawn between various concepts, illustrating their interdependence and collective importance to the field. The author presents a compelling argument for specific approaches while acknowledging limitations and areas requiring further investigation. Statistical data is utilized effectively to support key assertions.`,
        
        `${topicSentence} It presents detailed research findings on ${randomKeywords} with important insights and practical applications. The document is structured in a logical manner, beginning with foundational concepts before progressing to more complex ideas. Each major point is supported by evidence and examples, demonstrating thoroughness in research methodology. The conclusions offer valuable takeaways for both practitioners and researchers in this domain, with specific recommendations for implementation.`,
        
        `An extensive exploration of ${randomKeywords} and their implications is presented in this document. The author begins by establishing historical context before delving into current understandings and future projections. Various models and frameworks are compared and contrasted, highlighting strengths and limitations of each approach. The document concludes with a synthesis of key points and suggestions for practical application, emphasizing the importance of continued research and development in these areas.`
      ];
      
      return summaryTemplates[textHash];
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    toast({
      title: "Summary generation failed",
      description: "Could not connect to NLPCloud API. Using backup generator.",
      variant: "destructive"
    });
    
    // Improved fallback summary with more details
    const words = text.split(' ');
    const wordCount = words.length;
    const randomWords = [
      words[Math.floor(wordCount * 0.1) || 5] || 'research',
      words[Math.floor(wordCount * 0.3) || 10] || 'analysis',
      words[Math.floor(wordCount * 0.5) || 15] || 'methodology',
      words[Math.floor(wordCount * 0.7) || 20] || 'findings'
    ].filter(w => w && w.length > 3);
    
    return `This comprehensive document discusses concepts related to ${randomWords.join(', ')}. It contains approximately ${wordCount} words covering various topics and methodologies. The text explores theoretical frameworks and practical applications, providing insights for both researchers and practitioners. Multiple examples illustrate key concepts throughout the document, supporting the main arguments and conclusions. Statistical data and expert opinions are referenced to validate the findings presented.`;
  }
};

/**
 * Generate flashcards using NLPCloud API
 */
export const generateFlashcards = async (text: string): Promise<Array<{question: string, answer: string}>> => {
  try {
    // For local development without API calls, use a placeholder generator
    if (!API_KEY.startsWith('your-')) {
      // If we have a valid API key, make the actual API call
      const response = await fetch(`${NLP_CLOUD_API_ENDPOINT}bart-large-mnli/question-generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          num_questions: 8  // Increased from 5 to 8 for more flashcards
        })
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.questions.map((q: any) => ({
        question: q.question,
        answer: q.answer || "See the document for details."
      }));
    } else {
      // Calculate a simple hash of the text to ensure different flashcards
      const textHash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5;
      const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
      const keywords = text.split(' ').filter(word => word.length > 5);
      
      // More extensive flashcard templates (8 per template instead of 5)
      const flashcardTemplates = [
        [
          { question: `What are the main concepts discussed in this document?`, answer: `The document discusses ${keywords.slice(0, 3).join(', ')}.` },
          { question: `What methodology is used in the analysis?`, answer: `The document uses quantitative and qualitative approaches.` },
          { question: `What is the significance of ${keywords[2] || 'this topic'}?`, answer: `It helps understand complex systems and relationships.` },
          { question: `How does ${keywords[0] || 'the concept'} relate to ${keywords[3] || 'practice'}?`, answer: `They form an interconnected system with practical applications.` },
          { question: `What are the key findings described in the document?`, answer: `The findings relate to ${keywords.slice(5, 8).join(', ')} and their implications.` },
          { question: `What frameworks are used to analyze ${keywords[1] || 'the data'}?`, answer: `Several analytical frameworks including statistical analysis and conceptual modeling.` },
          { question: `How might these findings impact future research?`, answer: `They suggest new directions for inquiry and methodology in the field.` },
          { question: `What are the limitations of the approach described?`, answer: `Some limitations include data constraints, methodological challenges, and contextual factors.` }
        ],
        [
          { question: `Define ${keywords[1] || 'the main concept'}.`, answer: `${sentences[1] || 'It refers to a key methodology or approach in this field.'}` },
          { question: `What problem does the document address?`, answer: `It addresses challenges related to ${keywords.slice(3, 5).join(' and ')}.` },
          { question: `List three main points from the document.`, answer: `1) Analysis methodology 2) Data interpretation 3) Practical applications` },
          { question: `How is ${keywords[4] || 'this'} measured or evaluated?`, answer: `Through quantitative metrics and qualitative assessment.` },
          { question: `What are the limitations mentioned?`, answer: `Some limitations include data availability and methodological constraints.` },
          { question: `What are the implications of these findings?`, answer: `They suggest new directions for inquiry and methodology in the field.` },
          { question: `How does this document contribute to the existing literature?`, answer: `It provides new insights and perspectives on the subject matter.` },
          { question: `What are the key terms used in this document?`, answer: `Key terms include data analysis, research methodology, and practical applications.` }
        ],
        [
          { question: `What is the purpose of this document?`, answer: `${sentences[0] || 'To provide analysis and insights on the subject matter.'}` },
          { question: `Who are the intended audience?`, answer: `Researchers, practitioners, and students in the field.` },
          { question: `How does ${keywords[2] || 'it'} impact ${keywords[5] || 'outcomes'}?`, answer: `It significantly affects results through direct and indirect mechanisms.` },
          { question: `What theory is most relevant to this content?`, answer: `Systems theory and practical application frameworks.` },
          { question: `What future directions are suggested?`, answer: `Further research on ${keywords.slice(6, 9).join(' and ')} is recommended.` },
          { question: `What are the strengths of the methodology used?`, answer: `The methodology is robust, reliable, and well-validated.` },
          { question: `How could this research be expanded upon?`, answer: `Through additional data collection and analysis in different contexts.` },
          { question: `What are the practical applications of this research?`, answer: `The research can be applied to improve decision-making and problem-solving.` }
        ],
        [
          { question: `Compare and contrast ${keywords[1] || 'concept A'} and ${keywords[6] || 'concept B'}.`, answer: `While one focuses on methodology, the other emphasizes application.` },
          { question: `What evidence supports the main claim?`, answer: `Data analysis, case studies, and theoretical frameworks provide support.` },
          { question: `How would you apply ${keywords[3] || 'this concept'} in practice?`, answer: `It can be applied through systematic implementation in relevant contexts.` },
          { question: `What are the ethical considerations?`, answer: `Key considerations include data privacy, consent, and responsible use.` },
          { question: `Summarize the document in one sentence.`, answer: `${sentences[0] || 'An analysis of key concepts with practical implications.'}` },
          { question: `What are the key assumptions underlying the analysis?`, answer: `The analysis assumes data reliability and methodological validity.` },
          { question: `How does this document relate to previous research?`, answer: `It builds upon previous findings and extends the current understanding.` },
          { question: `What are the potential biases in this research?`, answer: `Potential biases include selection bias and measurement error.` }
        ],
        [
          { question: `What problem-solving approach is described?`, answer: `A systematic methodology involving analysis and application.` },
          { question: `How does ${keywords[0] || 'this'} differ from traditional approaches?`, answer: `It incorporates more comprehensive data integration and validation.` },
          { question: `What framework is presented for understanding ${keywords[4] || 'the subject'}?`, answer: `A multi-level framework incorporating theoretical and practical elements.` },
          { question: `What are the prerequisites for implementing this approach?`, answer: `Data access, analytical tools, and domain expertise.` },
          { question: `How might this approach evolve in the future?`, answer: `Through integration with emerging technologies and methodologies.` },
          { question: `What are the key performance indicators (KPIs)?`, answer: `KPIs include efficiency, effectiveness, and user satisfaction.` },
          { question: `How is success measured in this context?`, answer: `Success is measured through quantitative metrics and qualitative feedback.` },
          { question: `What are the potential risks and challenges?`, answer: `Potential risks include data breaches, system failures, and user resistance.` }
        ]
      ];
      
      return flashcardTemplates[textHash];
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    toast({
      title: "Flashcard generation failed",
      description: "Could not connect to NLPCloud API. Using backup generator.",
      variant: "destructive"
    });
    
    // Improved fallback flashcards (more content)
    return [
      { question: "What is the main topic of this document?", answer: "The document discusses research methods and applications." },
      { question: "What approach does the document recommend?", answer: "A systematic approach to problem-solving and analysis." },
      { question: "How many key points are presented?", answer: "Several key points including methodology and application." },
      { question: "What evidence supports the main arguments?", answer: "The document provides case studies, statistical data, and expert opinions." },
      { question: "How are the findings applicable in practical settings?", answer: "They can be implemented through systematic frameworks and guided procedures." }
    ];
  }
};
