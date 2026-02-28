import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconStar, IconMessageCircle, IconSend, IconUser } from '@tabler/icons-react';
import { fetchReviews, createReview } from '../services/dbService';
import './ProductReviews.css';

const ProductReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ userName: '', rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        let active = true;
        const loadReviews = async () => {
            setLoading(true);
            try {
                const data = await fetchReviews(productId);
                if (active) setReviews(data);
            } catch (err) {
                console.error('Error loading reviews:', err);
            } finally {
                if (active) setLoading(false);
            }
        };
        if (productId) loadReviews();
        return () => { active = false; };
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.userName || !formData.rating) return;

        setSubmitting(true);
        try {
            await createReview({
                id: crypto.randomUUID(),
                productId,
                userName: formData.userName,
                rating: formData.rating,
                comment: formData.comment
            });
            setSubmitted(true);
            setShowForm(false);
        } catch (err) {
            console.error('Error submitting review:', err);
            alert('Erro ao enviar avaliação. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const avgRating = reviews.length
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="product-reviews-container">
            <div className="reviews-header">
                <h4 className="reviews-title">Avaliações dos Clientes</h4>
                {reviews.length > 0 ? (
                    <div className="reviews-summary">
                        <div className="summary-stars">
                            {[...Array(5)].map((_, i) => (
                                <IconStar
                                    key={i}
                                    size={16}
                                    fill={i < Math.round(avgRating) ? '#d9b154' : 'none'}
                                    color={i < Math.round(avgRating) ? '#d9b154' : '#666'}
                                />
                            ))}
                        </div>
                        <span className="summary-rating">{avgRating} de 5</span>
                        <span className="summary-count">({reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'})</span>
                    </div>
                ) : (
                    <span className="no-reviews-badge">Novo</span>
                )}
            </div>

            {submitted ? (
                <div className="review-success-msg">
                    <IconMessageCircle size={24} color="#d9b154" />
                    <p>Obrigado pela sua avaliação! Ela será publicada após moderação.</p>
                </div>
            ) : showForm ? (
                <motion.form
                    className="review-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label>Seu Nome</label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Maria S."
                            value={formData.userName}
                            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Sua Nota</label>
                        <div className="rating-selector">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <IconStar
                                    key={star}
                                    size={24}
                                    style={{ cursor: 'pointer' }}
                                    fill={formData.rating >= star ? '#d9b154' : 'none'}
                                    color={formData.rating >= star ? '#d9b154' : '#666'}
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Comentário (opcional)</label>
                        <textarea
                            rows="3"
                            placeholder="O que achou do produto?"
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit" disabled={submitting}>
                            {submitting ? 'Enviando...' : <><IconSend size={16} /> Enviar Avaliação</>}
                        </button>
                    </div>
                </motion.form>
            ) : (
                <button className="btn-write-review" onClick={() => setShowForm(true)}>
                    Escrever uma avaliação
                </button>
            )}

            <div className="reviews-list">
                {loading ? (
                    <p className="loading-reviews">Carregando avaliações...</p>
                ) : reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-card-header">
                                <div className="reviewer-info">
                                    <div className="reviewer-avatar">
                                        <IconUser size={16} />
                                    </div>
                                    <span className="reviewer-name">{review.user_name}</span>
                                </div>
                                <div className="review-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <IconStar
                                            key={i}
                                            size={12}
                                            fill={i < review.rating ? '#d9b154' : 'none'}
                                            color={i < review.rating ? '#d9b154' : '#666'}
                                        />
                                    ))}
                                </div>
                            </div>
                            {review.comment && <p className="review-comment">{review.comment}</p>}
                        </div>
                    ))
                ) : (
                    <p className="empty-reviews">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
                )}
            </div>
        </div>
    );
};

export default ProductReviews;
