import { useState } from 'react';
import { FAQ_CONTENT } from '../data/faq';

function FAQ() {
    const { badge, title, description, items } = FAQ_CONTENT;
    const [openItems, setOpenItems] = useState(new Set());

    function toggleItem(id) {
        setOpenItems((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    return (
        <section className="faq" id="faq" aria-labelledby="faq-title">
            <div className="container">
                <div className="section-header">
                    <span className="section-header__badge">{badge}</span>
                    <h2 id="faq-title" className="section-header__title">
                        {title}
                    </h2>
                    <p className="section-header__desc">
                        {description}
                    </p>
                </div>

                <div className="faq__list" role="list">
                    {items.map((item) => {
                        const isOpen = openItems.has(item.id);
                        return (
                            <div key={item.id} className="faq__item" role="listitem">
                                <button
                                    className={`faq__question ${isOpen ? 'faq__question--open' : ''}`}
                                    onClick={() => toggleItem(item.id)}
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-answer-${item.id}`}
                                    id={`faq-question-${item.id}`}
                                >
                                    <span>{item.question}</span>
                                    <span className="faq__icon" aria-hidden="true">+</span>
                                </button>
                                <div
                                    id={`faq-answer-${item.id}`}
                                    className={`faq__answer ${isOpen ? 'faq__answer--open' : ''}`}
                                    role="region"
                                    aria-labelledby={`faq-question-${item.id}`}
                                >
                                    <p className="faq__answer-text">{item.answer}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default FAQ;
