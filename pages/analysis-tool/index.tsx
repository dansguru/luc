import React, { useEffect,useState } from 'react';
import ChunkLoader from '@/components/loader/chunk-loader';
import { localize } from '@deriv-com/translations';

const DigitCircles: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isLoading) {
                setHasError(true);
            }
        }, 10000);

        return () => clearTimeout(timer);
    }, [isLoading]);

    return (
        <div
            className='digit-circles-wrapper'
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100vw',
                padding: '20px',
            }}
        >
            <div
                style={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                }}
            >
                {isLoading && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1,
                        }}
                    >
                        <ChunkLoader message={localize('Loading Digit Circles...')} />
                    </div>
                )}

                {hasError && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            zIndex: 2,
                        }}
                    >
                        <h3>{localize('Unable to load Digit Circles')}</h3>
                        <p>{localize('This could be due to connection issues or content security restrictions.')}</p>
                        <p>
                            <a
                                href='https://circlesdigit.netlify.app/'
                                target='_blank'
                                rel='noopener noreferrer'
                                style={{
                                    display: 'inline-block',
                                    marginTop: '1rem',
                                    padding: '0.5rem 1rem',
                                    background: 'var(--brand-red-coral)',
                                    color: 'white',
                                    borderRadius: '4px',
                                    textDecoration: 'none',
                                }}
                            >
                                {localize('Try Again')}
                            </a>
                        </p>
                    </div>
                )}

                <iframe
                    src='https://circlesdigit.netlify.app/'
                    title='Digit Circles'
                    style={{
                        width: '100vw',
                        height: '100vh',
                        border: 'none',
                        borderRadius: '8px',
                        zIndex: hasError ? 0 : 1,
                    }}
                    sandbox='allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation allow-top-navigation-by-user-activation'
                    loading='lazy'
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setHasError(true);
                    }}
                />
            </div>
        </div>
    );
};

export default DigitCircles;
