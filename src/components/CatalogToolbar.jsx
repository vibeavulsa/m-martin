import React from 'react';
import { IconFilter, IconSortAscending } from '@tabler/icons-react';
import './CatalogToolbar.css';

const CatalogToolbar = ({ categoryFilter, setCategoryFilter, priceRange, setPriceRange, sortBy, setSortBy, categories, isSearching }) => {
    return (
        <div className="catalog-toolbar">
            <div className="toolbar-section">
                <IconFilter size={18} />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="toolbar-select"
                >
                    <option value="">Todas as Categorias</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="toolbar-select"
                >
                    <option value="">Qualquer Preço</option>
                    <option value="under_1000">Até R$ 1.000</option>
                    <option value="1000_3000">R$ 1.000 a R$ 3.000</option>
                    <option value="over_3000">Acima de R$ 3.000</option>
                </select>
            </div>

            <div className="toolbar-section">
                <IconSortAscending size={18} />
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="toolbar-select"
                >
                    <option value="default">Relevância / Padrao</option>
                    <option value="price_asc">Menor Preço</option>
                    <option value="price_desc">Maior Preço</option>
                    <option value="name_asc">Nome (A-Z)</option>
                </select>
            </div>

            {isSearching && (
                <div className="toolbar-search-info">
                    Resultados da busca:
                </div>
            )}
        </div>
    );
};

export default CatalogToolbar;
