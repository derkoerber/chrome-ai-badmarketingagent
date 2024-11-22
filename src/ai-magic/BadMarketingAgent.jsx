import { useEffect, useMemo, useRef, useState } from 'react';

const basePrompt = 'Tell me why we should make business with you.';
const buttonBaseCls =
    'max-w-44 bg-emerald-700 py-2 px-1 rounded-md disabled:bg-gray-500';

const BadMarketingAgent = () => {
    const jimmy = useRef();
    const conversationRef = useRef();
    const [isStreaming, setIsStreaming] = useState(false);
    const [aiAnswers, setAiAnswers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [latestChunk, setLatestChunk] = useState('');
    const [prompt, setPrompt] = useState('');

    const conversationMap = useMemo(() => {
        return questions.flatMap((question, index) => [
            { type: 'q', content: question },
            { type: 'a', content: aiAnswers[index] },
        ]);
    }, [aiAnswers, questions]);

    useEffect(() => {
        if (conversationRef.current) {
            const lastChild = conversationRef.current.lastElementChild;
            if (lastChild) {
                lastChild.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [conversationMap, latestChunk]);

    const handleStoryStartButtonClick = async (e) => {
        e.target.disabled = true;
        const llm = await self.ai.languageModel.create({
            initialPrompts: [
                {
                    role: 'system',
                    content: `
                        Your name is Jimmy the marketing guru.
                        A marketing magician that works for the eyeworkers GmbH, a company specialized in everything web.
                        We build websites with typo3 and wordpress and web applications with react, angular and extjs.
                        Improvise as much as you want. You could and should lie.
                        You can invent products or things the eyeworkers have done.
                        Anything to convince me to buy your products.
                        Always try to sell me products. Only generate a maximum of 250 characters.
                    `,
                },
            ],
        });

        jimmy.current = llm;
        promptGeminiNano(basePrompt);
    };

    const handleStoryPromptButtonClick = () => {
        promptGeminiNano(prompt);
    };

    const handleInputKeyUp = (e) => {
        if (e.code === 'Enter') {
            promptGeminiNano(prompt);
        }
    };

    const promptGeminiNano = async (prompt = '') => {
        setQuestions((oldQuestions) => [...oldQuestions, prompt]);
        let lChunk = '';
        try {
            setIsStreaming(true);
            const stream = jimmy.current.promptStreaming(prompt);
            for await (const chunk of stream) {
                setLatestChunk(chunk);
                lChunk = chunk;
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsStreaming(false);
            setAiAnswers((oldConv) => {
                return [...oldConv, lChunk];
            });
            setLatestChunk('');
            setPrompt('');
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {!jimmy.current && (
                <>
                    <button
                        className={buttonBaseCls}
                        onClick={handleStoryStartButtonClick}
                    >
                        Talk to jimmy
                    </button>
                </>
            )}

            {jimmy.current && (
                <>
                    <ul>
                        Gemini stats:
                        <li>max tokens: {jimmy.current.maxTokens}</li>
                        <li>tokens left: {jimmy.current.tokensLeft}</li>
                        <li>tokens used so far: {jimmy.current.tokensSoFar}</li>
                    </ul>
                    <input
                        type="text"
                        className="bg-slate-500 p-2"
                        placeholder="Ask me anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyUp={handleInputKeyUp}
                        disabled={isStreaming}
                    />
                    <button
                        type="button"
                        onClick={handleStoryPromptButtonClick}
                        disabled={isStreaming}
                        className={buttonBaseCls}
                    >
                        Prompt jimmy
                    </button>
                </>
            )}

            {isStreaming && (
                <span className="animate-bounce">
                    I am just gemini nano, a nlm (nano language model)... I am
                    slow
                </span>
            )}

            <div className="flex flex-col gap-2" ref={conversationRef}>
                {conversationMap.map(
                    (conv, index) =>
                        conv.content && (
                            <article
                                key={index}
                                className={
                                    'flex ' +
                                    (conv.type === 'q'
                                        ? 'justify-end'
                                        : 'justify-start')
                                }
                            >
                                <div
                                    className={`px-4 py-2 rounded-lg max-w-xs ${
                                        conv.type === 'q'
                                            ? 'bg-sky-500'
                                            : 'bg-emerald-700'
                                    }`}
                                >
                                    {conv.content}
                                </div>
                            </article>
                        )
                )}
                {latestChunk && (
                    <article className="justify-start">
                        <div className="px-4 py-2 rounded-lg max-w-xs bg-emerald-700">
                            {latestChunk}...
                        </div>
                    </article>
                )}
            </div>
        </div>
    );
};

export default BadMarketingAgent;
