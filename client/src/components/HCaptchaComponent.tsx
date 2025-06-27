import React from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { LegacyRef } from 'react';

type HCaptchaComponentProps = {
    onVerify: (token: string) => void;
    ref: LegacyRef<HCaptcha>;
}

const HCaptchaComponent = React.forwardRef<HCaptcha, HCaptchaComponentProps>(
    ({ onVerify }, ref) => {
        const handleVerificationSuccess = (token: string) => {
            onVerify(token);
        };
  
    return (
        <HCaptcha
            size='normal'
            ref={ref}
            onVerify={handleVerificationSuccess}
            sitekey={process.env.CAPTCHA_SITE_KEY!}
        />
    );
    }
);

HCaptchaComponent.displayName = "HCaptchaComponent";

export default HCaptchaComponent;