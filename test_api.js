const fetch = require('node-fetch');

async function check() {
    const res = await fetch('https://tools.dongvanfb.net/api/get_messages_oauth2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: "VjianRelax4762@outlook.com",
            refresh_token: "M.C524_BL2.0.U.MsaArtifacts.-ClZ7JMILgFDqiY0lpmn3QUaa9Fqr1PytFWTu4jSsAplV8OYMKivEG*z58uxAZiPMwc5LRSr4S6SmqsYiUCcz95*1CBQ!bPKwZO4Vz2!kzNMJxDryJtGvYg1fi!HQTmxi6MajJTDOVchvMeLmTrJRrz7zeeqCdQzZhK8!M3w0wcoRCBOtV8ySlgtEdAigiDYY8gAnYgx5Za7YEVDrR8se0nqCWQRaaUZEzyw0*2ywRvOzLVW2W1!5bVhiQz9oa0GTQCFq!btkFtXcP2dUfwvfcP1suYhKncAe0whOEby!EGDz0G!sMLNnCMYR4*r9BQTzYvQl5q7DXJjFHbeu0MGODlgOs98N29A2WL*OKNY45j!5rE8DAjBih!ZXKRSTluyBLQ$$",
            client_id: "9e5f94bc-e8a4-4e73-b8be-63364c29d753",
            list_mail: "all"
        })
    });
    const text = await res.text();
    console.log(text);
}
check();
