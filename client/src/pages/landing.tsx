import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function Landing() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | Record<string, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    {
      id: "spreadsheet_type",
      question: "What type of spreadsheet do you currently use for accounting?",
      type: "radio",
      options: [
        { value: "excel", label: "Microsoft Excel" },
        { value: "google_sheets", label: "Google Sheets" },
        { value: "numbers", label: "Apple Numbers" },
        { value: "other", label: "Other spreadsheet software" },
        { value: "none", label: "I don't use spreadsheets" },
      ],
    },
    {
      id: "accounting_frequency",
      question: "How often do you update your accounting records?",
      type: "radio",
      options: [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "yearly", label: "Yearly/At tax time" },
      ],
    },
    {
      id: "time_spent",
      question: "How much time do you spend on bookkeeping per month?",
      type: "radio",
      options: [
        { value: "less_than_1", label: "Less than 1 hour" },
        { value: "1_to_5", label: "1-5 hours" },
        { value: "6_to_10", label: "6-10 hours" },
        { value: "11_to_20", label: "11-20 hours" },
        { value: "more_than_20", label: "More than 20 hours" },
      ],
    },
    {
      id: "pain_points",
      question: "What are your biggest pain points with your current accounting method?",
      type: "checkbox",
      options: [
        { value: "time_consuming", label: "Too time-consuming" },
        { value: "data_entry", label: "Manual data entry errors" },
        { value: "organization", label: "Staying organized" },
        { value: "tax_compliance", label: "Tax compliance concerns" },
        { value: "reporting", label: "Creating financial reports" },
        { value: "understanding", label: "Understanding accounting principles" },
      ],
    },
    {
      id: "multiple_currencies",
      question: "Do you deal with multiple currencies in your business?",
      type: "radio",
      options: [
        { value: "yes_frequently", label: "Yes, frequently" },
        { value: "yes_occasionally", label: "Yes, occasionally" },
        { value: "no", label: "No, I only use one currency" },
      ],
    },
    {
      id: "expenses_tracking",
      question: "How do you currently track business expenses?",
      type: "radio",
      options: [
        { value: "paper_receipts", label: "Paper receipts" },
        { value: "spreadsheet", label: "Spreadsheet" },
        { value: "accounting_software", label: "Accounting software" },
        { value: "app", label: "Mobile app" },
        { value: "no_tracking", label: "I don't track expenses systematically" },
      ],
    },
    {
      id: "hmrc_submissions",
      question: "How do you currently prepare HMRC tax submissions?",
      type: "radio",
      options: [
        { value: "accountant", label: "I have an accountant do it" },
        { value: "self_manual", label: "I do it myself manually" },
        { value: "self_software", label: "I do it myself with software" },
        { value: "not_applicable", label: "Not applicable to me" },
      ],
    },
    {
      id: "mtd_awareness",
      question: "Are you aware of the Making Tax Digital (MTD) requirements from HMRC?",
      type: "radio",
      options: [
        { value: "very_aware", label: "Yes, I'm very familiar with the requirements" },
        { value: "somewhat_aware", label: "Yes, but I don't know all the details" },
        { value: "heard_of", label: "I've heard of it but don't know the requirements" },
        { value: "not_aware", label: "No, I'm not aware of MTD" },
      ],
    },
    {
      id: "import_feature",
      question: "How valuable would you find a feature to automatically import data from spreadsheets?",
      type: "radio",
      options: [
        { value: "extremely", label: "Extremely valuable" },
        { value: "very", label: "Very valuable" },
        { value: "somewhat", label: "Somewhat valuable" },
        { value: "slightly", label: "Slightly valuable" },
        { value: "not", label: "Not valuable" },
      ],
    },
    {
      id: "ai_comfort",
      question: "How comfortable are you with AI analyzing your financial data?",
      type: "radio",
      options: [
        { value: "very_comfortable", label: "Very comfortable" },
        { value: "comfortable", label: "Comfortable" },
        { value: "neutral", label: "Neutral" },
        { value: "uncomfortable", label: "Uncomfortable" },
        { value: "very_uncomfortable", label: "Very uncomfortable" },
      ],
    },
  ];

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send the survey data to our backend
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          answers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit survey');
      }

      toast({
        title: "Thank you for your interest!",
        description: "We'll be in touch soon with access to our prototype.",
      });
      
      // Redirect to the dashboard to show the prototype
      window.location.href = "/dashboard";
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCheckboxChange = (questionId: string, value: string, checked: boolean) => {
    const currentValues = answers[questionId] as Record<string, boolean> || {};
    
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...currentValues,
        [value]: checked,
      },
    }));
  };

  const canProceed = () => {
    if (currentStep < questions.length) {
      const currentQuestion = questions[currentStep];
      if (currentQuestion.type === "checkbox") {
        const checkboxAnswers = answers[currentQuestion.id] as Record<string, boolean> || {};
        return Object.values(checkboxAnswers).some(value => value === true);
      }
      return !!answers[currentQuestion.id];
    }
    return !!email;
  };

  const goNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderQuestion = () => {
    if (currentStep >= questions.length) {
      return (
        <form onSubmit={handleEmailSubmit}>
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle className="text-center">
                <span className="bg-gradient-to-r from-amber-500 to-yellow-300 bg-clip-text text-transparent">
                  Thanks for Your Feedback!
                </span>
              </CardTitle>
              <CardDescription className="text-center pt-2">
                Enter your email to get early access to our accounting system prototype
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={goPrevious}>
                Back
              </Button>
              <Button type="submit" disabled={!email || isSubmitting}>
                {isSubmitting ? "Submitting..." : "Get Access"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      );
    }

    const question = questions[currentStep];

    return (
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-xl">
            <span className="text-primary">
              Question {currentStep + 1} of {questions.length}
            </span>
          </CardTitle>
          <CardDescription className="text-lg pt-2">{question.question}</CardDescription>
        </CardHeader>
        <CardContent>
          {question.type === "radio" && (
            <RadioGroup
              value={answers[question.id] as string || ""}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div className="flex items-center space-x-2" key={option.value}>
                    <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                    <Label htmlFor={`${question.id}-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {question.type === "checkbox" && (
            <div className="space-y-3">
              {question.options.map((option) => {
                const checkboxValues = (answers[question.id] as Record<string, boolean>) || {};
                return (
                  <div className="flex items-center space-x-2" key={option.value}>
                    <Checkbox
                      id={`${question.id}-${option.value}`}
                      checked={!!checkboxValues[option.value]}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange(question.id, option.value, !!checked)
                      }
                    />
                    <Label htmlFor={`${question.id}-${option.value}`}>{option.label}</Label>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={goPrevious} disabled={currentStep === 0}>
            Previous
          </Button>
          <Button onClick={goNext} disabled={!canProceed()}>
            {currentStep === questions.length - 1 ? "Continue to Email" : "Next"}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-amber-500 to-yellow-300 bg-clip-text text-transparent">
              CloudAccount
            </span>
          </h1>
          <p className="text-xl">
            UK's smartest accounting system for sole traders and landlords
          </p>
        </div>

        <div className="flex justify-center">
          {renderQuestion()}
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Your answers will help us build a better product for your needs.</p>
          <p className="mt-1">We respect your privacy and will never share your data.</p>
        </div>
      </div>
    </div>
  );
}