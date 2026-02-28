import React, { useState, useEffect } from 'react';
import { fetchReviews, approveReview, deleteReview } from '../../services/dbService';
import { IconCheck, IconX, IconTrash, IconMessageCircle } from '@tabler/icons-react';
import './Admin.css'; // Reuse existing admin styles

const ReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setLoading(true);
        try {
            // Fetch all reviews (requires admin auth inside dbService)
            const data = await fetchReviews(null, true);
            setReviews(data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            alert('Erro ao carregar avaliações.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleApproval = async (id, currentStatus) => {
        try {
            await approveReview(id, !currentStatus);
            setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: !currentStatus } : r));
        } catch (error) {
            console.error('Error updating review:', error);
            alert('Erro ao atualizar avaliação.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta avaliação permanentemente?')) return;
        try {
            await deleteReview(id);
            setReviews(reviews.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Erro ao deletar avaliação.');
        }
    };

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <div className="admin-header-title">
                    <IconMessageCircle size={24} stroke={1.8} />
                    <h1>Gerenciar Avaliações</h1>
                </div>
            </div>

            <div className="admin-content-card">
                {loading ? (
                    <p>Carregando avaliações...</p>
                ) : reviews.length === 0 ? (
                    <p>Nenhuma avaliação recebida ainda.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Produto ID</th>
                                    <th>Cliente</th>
                                    <th>Nota</th>
                                    <th>Comentário</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map(review => (
                                    <tr key={review.id}>
                                        <td>{new Date(review.created_at).toLocaleDateString('pt-BR')}</td>
                                        <td>{review.product_id}</td>
                                        <td>{review.user_name}</td>
                                        <td>{review.rating} ⭐</td>
                                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {review.comment || '-'}
                                        </td>
                                        <td>{review.is_approved ? <span style={{ color: '#4caf50' }}>Aprovada</span> : <span style={{ color: '#ff9800' }}>Pendente</span>}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className={`btn-icon ${review.is_approved ? 'btn-decline' : 'btn-approve'}`}
                                                onClick={() => handleToggleApproval(review.id, review.is_approved)}
                                                title={review.is_approved ? 'Ocultar' : 'Aprovar'}
                                                style={{ marginRight: '8px', cursor: 'pointer', background: 'transparent', border: 'none', color: '#fff' }}
                                            >
                                                {review.is_approved ? <IconX size={18} color="#f44336" /> : <IconCheck size={18} color="#4caf50" />}
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDelete(review.id)}
                                                title="Excluir"
                                                style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#fff' }}
                                            >
                                                <IconTrash size={18} color="#f44336" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsPage;
