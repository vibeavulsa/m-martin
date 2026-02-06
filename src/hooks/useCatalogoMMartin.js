import { useMemo } from 'react';

export const useCatalogoMMartin = (categorias, produtos) => {
  const estruturaCatalogo = useMemo(() => {
    const resultado = new Map();
    
    categorias.forEach(cat => {
      resultado.set(cat.id, {
        metadados: cat,
        itens: []
      });
    });
    
    produtos.forEach(prod => {
      const secao = resultado.get(prod.category);
      if (secao) {
        secao.itens.push(prod);
      }
    });
    
    return Array.from(resultado.values());
  }, [categorias, produtos]);
  
  return estruturaCatalogo;
};
