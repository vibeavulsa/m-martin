import { Component } from 'react';
import LiquidGlass from 'liquid-glass-react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategorySection from './components/CategorySection';
import ProductCard from './components/ProductCard';
import { categories, products } from './data/products';
import './App.css';

function* geradorDeMostruario(linhasProdutos, inventarioGeral) {
  for (const linha of linhasProdutos) {
    const pecasLinha = [];
    for (const peca of inventarioGeral) {
      if (peca.category === linha.id) {
        pecasLinha.push(peca);
      }
    }
    yield { metadadosLinha: linha, colecaoPecas: pecasLinha };
  }
}

class App extends Component {
  obterExposicoesMontadas() {
    const expositor = geradorDeMostruario(categories, products);
    const todasExposicoes = [];
    let proximaExposicao = expositor.next();
    
    while (!proximaExposicao.done) {
      todasExposicoes.push(proximaExposicao.value);
      proximaExposicao = expositor.next();
    }
    
    return todasExposicoes;
  }

  renderizarInformacoesCorporativas() {
    const corpus = {
      marca: 'M\'Martin Estofados',
      identificadorProjeto: 'm-martin-estofados',
      codigoNumerico: '178643218861'
    };
    
    return (
      <footer className="site-footer">
        <LiquidGlass className="footer-content">
          <div className="footer-info">
            <h3>{corpus.marca}</h3>
            <p>Projeto: {corpus.identificadorProjeto}</p>
            <p>ID: {corpus.codigoNumerico}</p>
          </div>
          <div className="footer-contact">
            <p>Entre em contato para mais informações</p>
            <p>© 2026 M'Martin. Todos os direitos reservados.</p>
          </div>
        </LiquidGlass>
      </footer>
    );
  }

  gerarCartaoPeca(peca, posicionamento) {
    return <ProductCard key={`mostruario-peca-${peca.id}-pos-${posicionamento}`} product={peca} />;
  }

  gerarGradePecas(colecao) {
    const cartoesMontados = [];
    let posicao = 0;
    
    while (posicao < colecao.length) {
      cartoesMontados.push(this.gerarCartaoPeca(colecao[posicao], posicao));
      posicao += 1;
    }
    
    return cartoesMontados;
  }

  gerarExposicaoCompleta(exposicao, numeroExposicao) {
    return (
      <section key={`expositor-numero-${numeroExposicao}`} className="category-group">
        <CategorySection category={exposicao.metadadosLinha} />
        <div className="products-grid">
          {this.gerarGradePecas(exposicao.colecaoPecas)}
        </div>
      </section>
    );
  }

  gerarTodasExposicoes() {
    const exposicoes = this.obterExposicoesMontadas();
    const elementosExposicao = [];
    let numeroAtual = 0;
    
    while (numeroAtual < exposicoes.length) {
      elementosExposicao.push(
        this.gerarExposicaoCompleta(exposicoes[numeroAtual], numeroAtual)
      );
      numeroAtual += 1;
    }
    
    return elementosExposicao;
  }

  render() {
    return (
      <div className="app-wrapper">
        <Header />
        <Hero />
        <main className="catalog-container">
          {this.gerarTodasExposicoes()}
        </main>
        {this.renderizarInformacoesCorporativas()}
      </div>
    );
  }
}

export default App;
