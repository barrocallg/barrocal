import { useState } from 'react'
import { Link, useParams } from 'react-router'

export default function PaginaProduto({ produtos, onAdicionar, onSolicitarAviso }) {
  const { id } = useParams()
  const [nomeAviso, setNomeAviso] = useState('')
  const [emailAviso, setEmailAviso] = useState('')
  const [mensagemAviso, setMensagemAviso] = useState('')

  const produto = produtos.find((item) => item.id === id)

  if (!produto) {
    return (
      <div className="estado-vazio">
        <p>Produto não encontrado.</p>
        <Link to="/" className="botao botao-secundario">
          Voltar para a loja
        </Link>
      </div>
    )
  }

  const relacionadoDisponivel = (item) => item.id !== produto.id && item.estoque > 0 && Number(item.price) > 0
  const relacionados = produtos.filter(relacionadoDisponivel).slice(0, 4)
  const produtoEsgotado = Number(produto.estoque) === 0
  const precoValido = Number(produto.price) > 0

  function enviarAviso(evento) {
    evento.preventDefault()

    if (!nomeAviso.trim() || !emailAviso.trim()) {
      setMensagemAviso('Preencha nome e e-mail para receber o aviso.')
      return
    }

    onSolicitarAviso(produto.id, { nome: nomeAviso.trim(), email: emailAviso.trim() })
    setMensagemAviso('Você foi adicionado à lista de espera.')
    setNomeAviso('')
    setEmailAviso('')
  }

  return (
    <section>
      <nav className="trilha" aria-label="Você está em">
        <Link to="/">Loja</Link>
        <span aria-hidden="true">/</span>
        <span>{produto.title}</span>
      </nav>

      <div className="detalhe">
        <div className="detalhe-imagem-moldura">
          <img src={produto.image} alt={produto.title} className="detalhe-imagem" />
        </div>

        <div className="detalhe-info">
          <h1>{produto.title}</h1>
          <p className="card-avaliacao">
            ★ {produto.rating.rate} <span>({produto.rating.count} avaliações)</span>
          </p>
          <p className="detalhe-preco">
            {precoValido ? `R$ ${Number(produto.price).toFixed(2).replace('.', ',')}` : 'Preço indisponível'}
          </p>
          <p className="detalhe-descricao">{produto.description}</p>
          <p className="detalhe-estoque">
            {produtoEsgotado ? 'Produto esgotado' : `${produto.estoque} unidades disponíveis`}
          </p>

          <button
            className="botao botao-grande"
            onClick={() => onAdicionar(produto)}
            disabled={produtoEsgotado || !precoValido}
          >
            {produtoEsgotado ? 'Esgotado' : precoValido ? 'Adicionar ao carrinho' : 'Indisponível'}
          </button>

          {produtoEsgotado && (
            <form onSubmit={enviarAviso} className="cupom">
              <label className="rotulo">Receber aviso quando voltar</label>
              <input
                type="text"
                value={nomeAviso}
                onChange={(evento) => setNomeAviso(evento.target.value)}
                placeholder="Seu nome"
              />
              <input
                type="email"
                value={emailAviso}
                onChange={(evento) => setEmailAviso(evento.target.value)}
                placeholder="Seu e-mail"
              />
              <button type="submit" className="botao botao-secundario">
                Quero receber aviso
              </button>
              {mensagemAviso && <p className="mensagem-cupom">{mensagemAviso}</p>}
            </form>
          )}

          <ul className="detalhe-garantias">
            <li>Troca grátis em até 30 dias</li>
            <li>Parcele em até 10x sem juros</li>
          </ul>
        </div>
      </div>

      <h2>Produtos relacionados</h2>
      <div className="grade">
        {relacionados.map((item) => (
          <article key={item.id} className="card">
            <Link to={`/produto/${item.id}`} className="card-link">
              <div className="card-imagem-moldura">
                <img src={item.image} alt={item.title} className="card-imagem" />
              </div>
              <h3 className="card-titulo">{item.title}</h3>
            </Link>
            <p className="preco">R$ {Number(item.price).toFixed(2).replace('.', ',')}</p>
            <button className="botao" onClick={() => onAdicionar(item)}>
              Adicionar ao carrinho
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
