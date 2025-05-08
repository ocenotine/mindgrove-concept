
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash, Save, Check, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  explanation?: string;
}

interface Quiz {
  id: string;
  name: string;
  documentId: string;
  questions: Question[];
  lastTaken?: string;
}

const QuizEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const loadQuiz = () => {
      try {
        setLoading(true);
        const savedQuizzesStr = localStorage.getItem('savedQuizzes');
        if (savedQuizzesStr) {
          const savedQuizzes = JSON.parse(savedQuizzesStr);
          const foundQuiz = savedQuizzes.find((q: Quiz) => q.id === id);
          if (foundQuiz) {
            setQuiz(foundQuiz);
          } else {
            toast({
              title: "Quiz not found",
              description: "The requested quiz could not be found.",
              variant: "destructive"
            });
            navigate('/quiz');
          }
        } else {
          toast({
            title: "No quizzes available",
            description: "There are no saved quizzes.",
            variant: "destructive"
          });
          navigate('/quiz');
        }
      } catch (error) {
        console.error("Error loading quiz:", error);
        toast({
          title: "Error loading quiz",
          description: "There was a problem loading the quiz data.",
          variant: "destructive"
        });
        navigate('/quiz');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [id, navigate]);

  const updateQuizName = (name: string) => {
    if (!quiz) return;
    setQuiz({ ...quiz, name });
  };

  const updateQuestionText = (questionId: string, text: string) => {
    if (!quiz) return;
    const updatedQuestions = quiz.questions.map(q => 
      q.id === questionId ? { ...q, text } : q
    );
    setQuiz({ ...quiz, questions: updatedQuestions });
    
    // Clear any error for this question
    if (errors[`question_${questionId}`]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[`question_${questionId}`];
      setErrors(updatedErrors);
    }
  };

  const updateQuestionExplanation = (questionId: string, explanation: string) => {
    if (!quiz) return;
    const updatedQuestions = quiz.questions.map(q => 
      q.id === questionId ? { ...q, explanation } : q
    );
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const updateOptionText = (questionId: string, optionId: string, text: string) => {
    if (!quiz) return;
    const updatedQuestions = quiz.questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map(o => 
              o.id === optionId ? { ...o, text } : o
            ) 
          } 
        : q
    );
    setQuiz({ ...quiz, questions: updatedQuestions });
    
    // Clear any error for this option
    if (errors[`option_${questionId}_${optionId}`]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[`option_${questionId}_${optionId}`];
      setErrors(updatedErrors);
    }
  };

  const updateCorrectOption = (questionId: string, optionId: string) => {
    if (!quiz) return;
    const updatedQuestions = quiz.questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map(o => 
              ({ ...o, isCorrect: o.id === optionId })
            ) 
          } 
        : q
    );
    setQuiz({ ...quiz, questions: updatedQuestions });
    
    // Clear any error for this question's correct option
    if (errors[`correct_${questionId}`]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[`correct_${questionId}`];
      setErrors(updatedErrors);
    }
  };

  const addOption = (questionId: string) => {
    if (!quiz) return;
    const updatedQuestions = quiz.questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: [
              ...q.options, 
              { id: uuidv4(), text: '', isCorrect: q.options.length === 0 }
            ] 
          } 
        : q
    );
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const removeOption = (questionId: string, optionId: string) => {
    if (!quiz) return;
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question || question.options.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "Each question must have at least 2 options.",
        variant: "destructive"
      });
      return;
    }

    // Check if we're removing the correct option
    const isCorrectOption = question.options.find(o => o.id === optionId)?.isCorrect;
    
    let updatedQuestions = quiz.questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.filter(o => o.id !== optionId)
          } 
        : q
    );
    
    // If we removed the correct answer, make the first option correct
    if (isCorrectOption) {
      updatedQuestions = updatedQuestions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options.map((o, index) => 
                index === 0 ? { ...o, isCorrect: true } : o
              ) 
            } 
          : q
      );
    }
    
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const addQuestion = () => {
    if (!quiz) return;
    const newQuestion: Question = {
      id: uuidv4(),
      text: '',
      options: [
        { id: uuidv4(), text: '', isCorrect: true },
        { id: uuidv4(), text: '', isCorrect: false }
      ],
      explanation: ''
    };
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
  };

  const removeQuestion = (questionId: string) => {
    if (!quiz) return;
    if (quiz.questions.length <= 1) {
      toast({
        title: "Cannot remove question",
        description: "The quiz must have at least one question.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedQuestions = quiz.questions.filter(q => q.id !== questionId);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const validateQuiz = (): boolean => {
    if (!quiz) return false;
    
    const newErrors: Record<string, string[]> = {};
    
    // Validate quiz name
    if (!quiz.name.trim()) {
      newErrors.quiz_name = ['Quiz name is required'];
    }
    
    // Validate each question
    quiz.questions.forEach(question => {
      if (!question.text.trim()) {
        newErrors[`question_${question.id}`] = ['Question text is required'];
      }
      
      // Check if there's at least one correct option
      const hasCorrectOption = question.options.some(o => o.isCorrect);
      if (!hasCorrectOption) {
        newErrors[`correct_${question.id}`] = ['One option must be marked as correct'];
      }
      
      // Validate each option
      question.options.forEach(option => {
        if (!option.text.trim()) {
          newErrors[`option_${question.id}_${option.id}`] = ['Option text is required'];
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveQuiz = () => {
    if (!quiz) return;
    
    if (!validateQuiz()) {
      toast({
        title: "Validation failed",
        description: "Please fix the errors before saving.",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    try {
      const savedQuizzesStr = localStorage.getItem('savedQuizzes');
      const savedQuizzes = savedQuizzesStr ? JSON.parse(savedQuizzesStr) : [];
      
      // Update or add the quiz
      const quizIndex = savedQuizzes.findIndex((q: Quiz) => q.id === quiz.id);
      if (quizIndex >= 0) {
        savedQuizzes[quizIndex] = quiz;
      } else {
        savedQuizzes.push(quiz);
      }
      
      localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes));
      
      toast({
        title: "Quiz saved",
        description: "Your changes have been saved successfully."
      });
      
      navigate('/quiz');
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Error saving quiz",
        description: "There was a problem saving your changes.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <PageTransition>
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </div>
        </PageTransition>
      </MainLayout>
    );
  }

  if (!quiz) {
    return (
      <MainLayout>
        <PageTransition>
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Quiz not found</h1>
              <Button onClick={() => navigate('/quiz')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
              </Button>
            </div>
          </div>
        </PageTransition>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/quiz')} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
              </Button>
              <h1 className="text-3xl font-bold">Edit Quiz</h1>
            </div>
            <Button 
              onClick={saveQuiz}
              disabled={saving}
              className="min-w-[100px]"
            >
              {saving ? (
                <span className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="mr-2 h-4 w-4" /> Save
                </span>
              )}
            </Button>
          </div>
          
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <CardTitle>Quiz Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quiz-name">Quiz Name</Label>
                  <Input
                    id="quiz-name"
                    value={quiz.name}
                    onChange={(e) => updateQuizName(e.target.value)}
                    placeholder="Enter quiz name"
                    className={errors.quiz_name ? 'border-red-500' : ''}
                  />
                  {errors.quiz_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.quiz_name.join(', ')}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-8 mb-8">
            {quiz.questions.map((question, questionIndex) => (
              <Card key={question.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Question {questionIndex + 1}</CardTitle>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor={`question-${question.id}`}>Question Text</Label>
                    <Textarea
                      id={`question-${question.id}`}
                      value={question.text}
                      onChange={(e) => updateQuestionText(question.id, e.target.value)}
                      placeholder="Enter the question"
                      className={errors[`question_${question.id}`] ? 'border-red-500' : ''}
                    />
                    {errors[`question_${question.id}`] && (
                      <p className="text-sm text-red-500 mt-1">{errors[`question_${question.id}`].join(', ')}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Options (select the correct answer)</Label>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addOption(question.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Option
                      </Button>
                    </div>
                    
                    {errors[`correct_${question.id}`] && (
                      <div className="flex items-center bg-red-50 dark:bg-red-950/30 text-red-500 p-2 rounded border border-red-200 dark:border-red-800 text-sm">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {errors[`correct_${question.id}`].join(', ')}
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <RadioGroup 
                        value={question.options.find(o => o.isCorrect)?.id || ''}
                        onValueChange={(value) => updateCorrectOption(question.id, value)}
                      >
                        {question.options.map(option => (
                          <div key={option.id} className="flex items-start space-x-2 p-3 border rounded-md hover:bg-muted/40 transition-colors">
                            <RadioGroupItem id={`option-${option.id}`} value={option.id} className="mt-1" />
                            <div className="flex-grow space-y-1">
                              <div className="flex items-center space-x-2">
                                <Label htmlFor={`option-${option.id}`} className="cursor-pointer">Option Text</Label>
                                {option.isCorrect && <Check className="h-4 w-4 text-green-500" />}
                              </div>
                              <Input
                                value={option.text}
                                onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                                placeholder="Enter option text"
                                className={errors[`option_${question.id}_${option.id}`] ? 'border-red-500' : ''}
                              />
                              {errors[`option_${question.id}_${option.id}`] && (
                                <p className="text-xs text-red-500">{errors[`option_${question.id}_${option.id}`].join(', ')}</p>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => removeOption(question.id, option.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`explanation-${question.id}`}>Explanation (Optional)</Label>
                    <Textarea
                      id={`explanation-${question.id}`}
                      value={question.explanation || ''}
                      onChange={(e) => updateQuestionExplanation(question.id, e.target.value)}
                      placeholder="Explain the correct answer (optional)"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="flex justify-center">
              <Button onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => navigate('/quiz')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={saveQuiz}
              disabled={saving}
              className="min-w-[100px]"
            >
              {saving ? (
                <span className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="mr-2 h-4 w-4" /> Save Quiz
                </span>
              )}
            </Button>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
};

export default QuizEdit;
