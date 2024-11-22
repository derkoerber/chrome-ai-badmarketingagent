import { useEffect, useState } from 'react';
import BadMarketingAgent from './ai-magic/BadMarketingAgent';

function App() {
    const [geminiIsReady, setGeminiIsReady] = useState(false);

    useEffect(() => {
        (async () => {
            const isAvailable = (await self.ai?.languageModel?.capabilities?.())
                ?.available;

            if (!isAvailable || isAvailable === 'no') {
                return;
            }
            setGeminiIsReady(true);
        })();
    }, []);

    return geminiIsReady ? (
        <div className="w-10/12 m-auto flex flex-col gap-4">
            <h1>
                Find more on{' '}
                <a
                    href="https://chrome.dev/"
                    target="_blank"
                    className="text-sky-500"
                >
                    chrome.dev
                </a>
            </h1>
            <BadMarketingAgent />
        </div>
    ) : (
        <div>Do you even gemini prompt api?</div>
    );
}

export default App;
