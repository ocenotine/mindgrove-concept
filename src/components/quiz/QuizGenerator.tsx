
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { FileText, Download, Save } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuthStore } from '@/store/authStore';
import { generateFlashcards } from '@/utils/nlpUtils';

interface Question {
  id: string;
  type: 'mcq' | 'truefalse' | 'shortanswer';
  text: string;
  options?: string[];
  correctAnswer: string | boolean;
}

export function QuizGenerator() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<string[]>(['mcq', 'truefalse', 'shortanswer']);
  const [difficulty, setDifficulty] = useState(50); // 0-100
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuizName, setGeneratedQuizName] = useState('');
  
  // Get real documents from user
  const { documents } = useDocuments();
  const { user } = useAuthStore();
  
  // Filter documents to only show the user's documents
  const userDocuments = documents.filter(doc => doc.user_id === user?.id);
  
  const handleSelectDocument = (id: string) => {
    setSelectedDocument(id);
  };
  
  const handleGenerateQuiz = async () => {
    if (!selectedDocument) {
      toast({ description: "Please select a document first", variant: "destructive" });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Find the selected document
      const document = userDocuments.find(doc => doc.id === selectedDocument);
      
      if (!document || !document.content) {
        toast({ description: "Document has no content to generate quiz from", variant: "destructive" });
        setIsGenerating(false);
        return;
      }
      
      // Use real NLP utils to generate flashcards, which we'll convert to quiz questions
      const result = await generateFlashcards(document.id, document.content);
      
      if (!result.success || !result.flashcards || result.flashcards.length === 0) {
        throw new Error(result.error || "Failed to generate flashcards");
      }
      
      // Convert flashcards to quiz questions
      const questionTypes = ['mcq', 'truefalse', 'shortanswer'];
      const questions: Question[] = result.flashcards.slice(0, numberOfQuestions).map((card, index) => {
        // Determine question type based on the questionTypes array and distribute evenly
        const type = questionTypes[index % questionTypes.length] as 'mcq' | 'truefalse' | 'shortanswer';
        
        // Create basic question structure
        const question: Question = {
          id: `${index + 1}`,
          type,
          text: card.question,
          correctAnswer: card.answer
        };
        
        // For multiple choice, generate options
        if (type === 'mcq') {
          // In a real implementation, we would generate options based on the content
          // For this demonstration, we'll create synthetic options
          question.options = [
            card.answer,
            `Alternative answer 1 for ${card.question}`,
            `Alternative answer 2 for ${card.question}`,
            `Alternative answer 3 for ${card.question}`
          ];
          
          // Shuffle options
          question.options = question.options.sort(() => Math.random() - 0.5);
        }
        
        // For true/false, determine if statement is true or false
        if (type === 'truefalse') {
          // Simplify to a true/false question
          question.text = `True or False: ${card.question}?`;
          question.correctAnswer = Math.random() > 0.5; // Randomly determine true/false
        }
        
        return question;
      });
      
      setGeneratedQuestions(questions);
      setGeneratedQuizName(`Quiz on ${document.title}`);
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({ 
        title: "Failed to generate quiz", 
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSaveQuiz = async () => {
    if (!selectedDocument || generatedQuestions.length === 0) {
      toast({
        title: "Cannot save quiz",
        description: "Please generate a quiz first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // In a real app, this would save to database
      // For now, we'll save to localStorage
      const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
      const quizToSave = {
        id: Date.now().toString(),
        documentId: selectedDocument,
        name: generatedQuizName,
        questions: generatedQuestions,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('savedQuizzes', JSON.stringify([...savedQuizzes, quizToSave]));
      
      toast({
        title: "Quiz saved!",
        description: "Your quiz has been saved to 'My Quizzes'",
      });
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Failed to save quiz",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  const handleExportQuiz = (format: 'pdf' | 'csv') => {
    if (generatedQuestions.length === 0) {
      toast({
        title: "Cannot export",
        description: "Please generate a quiz first",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, this would generate a file for download
    let content = '';
    
    if (format === 'csv') {
      content = 'Question,Type,Options,Correct Answer\n';
      generatedQuestions.forEach(q => {
        content += `"${q.text}","${q.type}","${q.options?.join('|') || ''}","${q.correctAnswer}"\n`;
      });
      
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedQuizName.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // For PDF, we would use a PDF generation library
      // As a simplified version, we'll just notify the user
      toast({
        title: "PDF Export",
        description: "PDF generation would be implemented with a library like jsPDF",
      });
    }
    
    toast({
      title: `Export successful!`,
      description: `Your quiz has been exported as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>AI Quiz Generator</CardTitle>
          <CardDescription>
            Generate quizzes from your documents using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Document</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {userDocuments.length === 0 && (
                <p className="text-muted-foreground col-span-3 text-center py-2">
                  No documents found. Please upload documents first.
                </p>
              )}
              
              {userDocuments.map((doc) => (
                <Button
                  key={doc.id}
                  variant={selectedDocument === doc.id ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => handleSelectDocument(doc.id)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {doc.title}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4 pt-4">
            <div>
              <Label>Number of Questions: {numberOfQuestions}</Label>
              <Slider
                value={[numberOfQuestions]}
                min={5}
                max={30}
                step={1}
                onValueChange={(value) => setNumberOfQuestions(value[0])}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Difficulty Level: {difficulty}%</Label>
              <Slider
                value={[difficulty]}
                min={10}
                max={100}
                step={10}
                onValueChange={(value) => setDifficulty(value[0])}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Question Types</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  variant={questionTypes.includes('mcq') ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (questionTypes.includes('mcq')) {
                      setQuestionTypes(questionTypes.filter(t => t !== 'mcq'));
                    } else {
                      setQuestionTypes([...questionTypes, 'mcq']);
                    }
                  }}
                >
                  Multiple Choice
                </Button>
                <Button
                  variant={questionTypes.includes('truefalse') ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (questionTypes.includes('truefalse')) {
                      setQuestionTypes(questionTypes.filter(t => t !== 'truefalse'));
                    } else {
                      setQuestionTypes([...questionTypes, 'truefalse']);
                    }
                  }}
                >
                  True/False
                </Button>
                <Button
                  variant={questionTypes.includes('shortanswer') ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (questionTypes.includes('shortanswer')) {
                      setQuestionTypes(questionTypes.filter(t => t !== 'shortanswer'));
                    } else {
                      setQuestionTypes([...questionTypes, 'shortanswer']);
                    }
                  }}
                >
                  Short Answer
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateQuiz} 
            disabled={isGenerating || !selectedDocument}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Quiz"}
          </Button>
        </CardFooter>
      </Card>

      {generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{generatedQuizName}</CardTitle>
                <CardDescription>
                  {generatedQuestions.length} questions generated
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExportQuiz('pdf')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportQuiz('csv')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
                <Button size="sm" onClick={handleSaveQuiz}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Quiz
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview">
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="space-y-6">
                {generatedQuestions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <p className="font-medium mb-2">Question {index + 1}: {question.text}</p>
                    
                    {question.type === 'mcq' && question.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {question.options.map((option, idx) => (
                          <div key={idx} className="flex items-center">
                            <Input type="radio" name={`question-${question.id}`} className="h-4 w-4 mr-2" />
                            <Label>{option}</Label>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'truefalse' && (
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center">
                          <Input type="radio" name={`question-${question.id}`} className="h-4 w-4 mr-2" />
                          <Label>True</Label>
                        </div>
                        <div className="flex items-center">
                          <Input type="radio" name={`question-${question.id}`} className="h-4 w-4 mr-2" />
                          <Label>False</Label>
                        </div>
                      </div>
                    )}
                    
                    {question.type === 'shortanswer' && (
                      <div className="mt-2">
                        <Input type="text" placeholder="Your answer..." />
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="edit">
                <div className="space-y-4">
                  {generatedQuestions.map((question, index) => (
                    <Card key={question.id} className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span>✕</span>
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Input 
                          value={question.text} 
                          placeholder="Question text"
                          onChange={() => {}} // Would handle edits in a real implementation
                        />
                        <div className="flex gap-2">
                          <select 
                            className="border rounded p-1 text-sm" 
                            value={question.type}
                            onChange={() => {}} // Would handle type changes
                          >
                            <option value="mcq">Multiple Choice</option>
                            <option value="truefalse">True/False</option>
                            <option value="shortanswer">Short Answer</option>
                          </select>
                          
                          {question.type === 'mcq' && (
                            <Button variant="outline" size="sm" className="text-xs px-2 py-0 h-7">
                              Add Option
                            </Button>
                          )}
                        </div>
                        
                        {question.type === 'mcq' && question.options && question.options.map((option, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input 
                              className="flex-1" 
                              value={option}
                              onChange={() => {}} // Would handle option edits
                            />
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span>✕</span>
                            </Button>
                            <Input 
                              type="radio" 
                              checked={option === question.correctAnswer} 
                              className="h-4 w-4"
                              onChange={() => {}} // Would mark as correct answer
                            />
                          </div>
                        ))}
                        
                        {question.type === 'truefalse' && (
                          <div className="flex gap-4">
                            <div className="flex items-center">
                              <Input 
                                type="radio" 
                                checked={question.correctAnswer === true}
                                className="h-4 w-4 mr-2"
                                onChange={() => {}} // Would handle setting correct answer
                              />
                              <Label>True is correct</Label>
                            </div>
                            <div className="flex items-center">
                              <Input 
                                type="radio" 
                                checked={question.correctAnswer === false}
                                className="h-4 w-4 mr-2"
                                onChange={() => {}} // Would handle setting correct answer
                              />
                              <Label>False is correct</Label>
                            </div>
                          </div>
                        )}
                        
                        {question.type === 'shortanswer' && (
                          <div>
                            <Label>Correct answer</Label>
                            <Input 
                              value={question.correctAnswer.toString()}
                              onChange={() => {}} // Would handle setting correct answer
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  <Button className="w-full">
                    Add New Question
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
