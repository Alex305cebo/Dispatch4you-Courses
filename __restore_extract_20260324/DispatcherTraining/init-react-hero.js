// Инициализация React Hero компонента
import React from 'react';
import ReactDOM from 'react-dom/client';
import HeroScrollVideo from './hero-react-app/src/components/HeroScrollVideo.jsx';

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.getElementById('react-hero-root');

    if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(
            React.createElement(HeroScrollVideo, {
                title: "Станьте профессиональным диспетчером",
                subtitle: "Полный курс обучения",
                meta: "2025",
                credits: React.createElement(React.Fragment, null,
                    React.createElement('p', null, 'Профессиональное обучение'),
                    React.createElement('p', null, 'Dispatch Training')
                ),
                media: "/hero-react-app/public/video/hero-video.mp4",
                mediaType: "video",
                overlay: {
                    caption: "КУРС • 2025",
                    heading: "Практика на реальных кейсах",
                    paragraphs: [
                        "12 модулей обучения с реальными примерами",
                        "50+ кейсов из индустрии грузоперевозок",
                        "Сертификат по окончанию курса"
                    ]
                },
                initialBoxSize: 360,
                targetSize: "fullscreen",
                scrollHeightVh: 280,
                showHeroExitAnimation: true,
                sticky: true,
                overlayBlur: 10,
                overlayRevealDelay: 0.35,
                smoothScroll: true
            })
        );
    }
});
