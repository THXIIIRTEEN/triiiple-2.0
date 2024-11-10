import React from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

type HCaptchaComponentProps = {
    onVerify: (token: string) => void;
}

const HCaptchaComponent: React.FC<HCaptchaComponentProps> = ({onVerify}) => {

    const handleVerificationSuccess = (token: string) => {
        onVerify(token)
    }

    return (
        <HCaptcha
            onVerify={handleVerificationSuccess}
            sitekey={process.env.CAPTCHA_SITE_KEY}
        />
    )

}

export default HCaptchaComponent;