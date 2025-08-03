
import React, { useState } from 'react';
import CustomerPageLayout from '@/components/customer/CustomerPageLayout';
import { useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackFormData {
  rating: string;
  comments: string;
}

const Feedback: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FeedbackFormData>({
    rating: '',
    comments: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (value: string) => {
    setFormData(prev => ({ ...prev, rating: value }));
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, comments: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rating) {
      toast.error(t('pleaseSelectRating') || 'Please select a rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement feedback submission logic
      console.log('Submitting feedback:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(t('feedbackSubmittedSuccessfully') || 'Feedback submitted successfully');
      
      // Reset form
      setFormData({ rating: '', comments: '' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(t('errorSubmittingFeedback') || 'Error submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <CustomerPageLayout title={t('feedback') || 'Feedback & Rating'}>
      <div className="space-y-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              {t('serviceRatingAndFeedback') || 'Service Rating & Feedback'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rating">
                  {t('rating') || 'Rating'} (1-5) *
                </Label>
                <Select value={formData.rating} onValueChange={handleRatingChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectRating') || 'Select Rating'} />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{rating}</span>
                          {renderStarRating(rating)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">
                  {t('comments') || 'Comments'}
                </Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={handleCommentsChange}
                  placeholder={t('shareFeedbackPlaceholder') || 'Share your experience with our service...'}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.rating}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? t('submitting') || 'Submitting...' : t('submit') || 'Submit Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>
              {t('howToProvideFeedback') || 'How to Provide Feedback'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• {t('feedbackInstruction1') || 'Rate your overall experience from 1 to 5 stars'}</li>
              <li>• {t('feedbackInstruction2') || 'Share specific details about your delivery experience'}</li>
              <li>• {t('feedbackInstruction3') || 'Your feedback helps us improve our service quality'}</li>
              <li>• {t('feedbackInstruction4') || 'All feedback is reviewed by our customer service team'}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </CustomerPageLayout>
  );
};

export default Feedback;
