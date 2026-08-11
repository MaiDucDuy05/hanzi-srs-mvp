import type { Metadata } from 'next';
import { ContactForm } from '@/features/contact/components/contact-form';
import { Card, CardBody, CardHeader } from '@/features/ui/components/card';

// SEO (P1-1): trang công khai là Server Component, chỉ form liên hệ là client island.
export const metadata: Metadata = {
  title: 'Liên hệ',
  description: 'Phản hồi, góp ý hoặc cần hỗ trợ về nền tảng học tiếng Trung Hán Tự HSK.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto mt-6 max-w-lg">
      <Card>
        <CardHeader
          title="Liên hệ với chúng tôi"
          subtitle="Phản hồi, góp ý hoặc cần hỗ trợ — chúng tôi sẽ phản hồi sớm."
        />
        <CardBody>
          <ContactForm />
        </CardBody>
      </Card>
    </div>
  );
}
