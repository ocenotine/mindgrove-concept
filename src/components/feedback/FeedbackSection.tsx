
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'

export const FeedbackSection = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase.functions.invoke('send-feedback', {
        body: { name, email, feedback }
      })

      if (error) throw error

      toast({
        title: "Feedback sent successfully!",
        description: "We'll reach out to you soon.",
      })

      // Reset form
      setName('')
      setEmail('')
      setFeedback('')
    } catch (error) {
      console.error('Error sending feedback:', error)
      toast({
        title: "Error sending feedback",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-lg max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-semibold mb-6">Contact Us</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
          />
        </div>
        <div>
          <label htmlFor="feedback" className="block text-sm font-medium mb-2">
            Feedback
          </label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[100px]"
            required
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Feedback'}
        </Button>
      </form>
    </div>
  )
}
