
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check, X, RefreshCw, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
}

interface Quiz {
  id: string;
  name: string;
  documentId: string;
  questions: Question[];
  lastTaken?: string;
}

const QuizPractice = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

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
            setScore({ correct: 0, total: foundQuiz.questions.length });
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

  const currentQuestion = quiz?.questions[currentQuestionIndex];

  const handleOptionSelect = (optionId: string) => {
    if (!hasSubmitted) {
      setSelectedOptionId(optionId);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || !currentQuestion) return;

    const selectedOption = currentQuestion.options.find(opt => opt.id === selectedOptionId);
    if (!selectedOption) return;

    setHasSubmitted(true);
    const correct = selectedOption.isCorrect;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }

    // Update last taken timestamp for the quiz
    const savedQuizzesStr = localStorage.getItem('savedQuizzes');
    if (savedQuizzesStr && quiz) {
      const savedQuizzes = JSON.parse(savedQuizzesStr);
      const updatedQuizzes = savedQuizzes.map((q: Quiz) => {
        if (q.id === quiz.id) {
          return {
            ...q,
            lastTaken: new Date().toISOString()
          };
        }
        return q;
      });
      localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes));
    }
  };

  const handleNextQuestion = () => {
    if (!quiz) return;

    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    
    if (isLastQuestion) {
      setQuizCompleted(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionId(null);
      setHasSubmitted(false);
      setIsCorrect(false);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setHasSubmitted(false);
    setIsCorrect(false);
    setScore({ correct: 0, total: quiz?.questions.length || 0 });
    setQuizCompleted(false);
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

  if (quizCompleted) {
    const percentage = Math.round((score.correct / score.total) * 100);
    
    return (
      <MainLayout>
        <PageTransition>
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Button variant="ghost" size="sm" onClick={() => navigate('/quiz')} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
              </Button>
              <h1 className="text-3xl font-bold">{quiz?.name}</h1>
            </div>
            
            <Card className="max-w-xl mx-auto">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
                <CardDescription>
                  You scored {score.correct} out of {score.total} questions
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6 pt-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Your Score</span>
                    <span>{percentage}%</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-3"
                    indicatorClassName={
                      percentage >= 80 ? "bg-green-500" :
                      percentage >= 60 ? "bg-amber-500" :
                      "bg-red-500"
                    }
                  />
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-center">
                    {percentage >= 80 ? (
                      "Great job! You have a strong understanding of this topic."
                    ) : percentage >= 60 ? (
                      "Good work! You're on the right track but might need some review."
                    ) : (
                      "Keep practicing! This topic needs more review."
                    )}
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/quiz')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> All Quizzes
                </Button>
                <Button onClick={handleRetakeQuiz}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Retake Quiz
                </Button>
              </CardFooter>
            </Card>
          </div>
        </PageTransition>
      </MainLayout>
    );
  }

  if (!quiz || !currentQuestion) {
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
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/quiz')} className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
            </Button>
            <h1 className="text-3xl font-bold">{quiz.name}</h1>
            
            <div className="mt-4 mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%</span>
              </div>
              <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} className="h-2" />
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">
                {currentQuestion.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  const showCorrectStyle = hasSubmitted && option.isCorrect;
                  const showIncorrectStyle = hasSubmitted && isSelected && !option.isCorrect;
                  
                  return (
                    <div
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                      className={`
                        p-4 rounded-md border cursor-pointer transition-all
                        ${isSelected && !hasSubmitted ? 'border-primary bg-primary/5' : 'border-border'}
                        ${showCorrectStyle ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : ''}
                        ${showIncorrectStyle ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : ''}
                        ${!isSelected && !showCorrectStyle ? 'hover:border-gray-400 hover:bg-muted/50' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>{option.text}</div>
                        {hasSubmitted && (
                          <>
                            {option.isCorrect ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : isSelected ? (
                              <X className="h-5 w-5 text-red-500" />
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {hasSubmitted && currentQuestion.explanation && (
                <div className={`mt-6 p-4 rounded-md border ${isCorrect ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20' : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20'}`}>
                  <p className="font-medium mb-1">{isCorrect ? 'Correct!' : 'Explanation:'}</p>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {hasSubmitted ? (
                  `Current score: ${score.correct} of ${currentQuestionIndex + 1}`
                ) : (
                  "Select an answer"
                )}
              </div>
              {!hasSubmitted ? (
                <Button 
                  onClick={handleSubmitAnswer} 
                  disabled={!selectedOptionId}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </PageTransition>
    </MainLayout>
  );
};

export default QuizPractice;
