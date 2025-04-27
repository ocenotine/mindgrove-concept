
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What is MindGrove?",
      answer: "MindGrove is an AI-powered academic progress and motivation platform that helps students, researchers, and educators optimize their learning and research experience."
    },
    {
      question: "Is MindGrove free for students?",
      answer: "Yes! MindGrove is completely free for students. We believe in making education accessible to everyone."
    },
    {
      question: "How does the AI summarization work?",
      answer: "Our AI analyzes your documents and generates concise summaries by identifying key concepts, main ideas, and important details while maintaining context and accuracy."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take data security seriously. All your documents and personal information are encrypted and stored securely. We never share your data with third parties."
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
