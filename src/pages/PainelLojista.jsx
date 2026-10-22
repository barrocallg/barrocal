const CATEGORIAS = ['roupas', 'eletronicos', 'acessorios', 'casa']

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor) || 0)
}

export default function PainelLojista({ produtos = [], listaEspera = [] }) {
  const clientesPorProduto = listaEspera.reduce((acumulador, item) => {
    const chave = item.produtoId
    acumulador[chave] = (acumulador[chave] || 0) + 1
    return acumulador
  }, {})

  const resumoPorCategoria = CATEGORIAS.map((categoria) => {
    const itens = (produtos || []).filter((produto) => produto.category === categoria)
    const itensVendaveis = itens.filter(
      (produto) => Number(produto.estoque) > 0 && Number(produto.price) > 0
    )

    const valorEmEstoque = itensVendaveis.reduce(
      (total, produto) => total + Number(produto.price) * Number(produto.estoque),
      0
    )

    const lucroEstimado = itensVendaveis.reduce((total, produto) => {
      const precoOriginal = Number(produto.precoOriginal)
      const precoAtual = Number(produto.price)

      if (!Number.isFinite(precoOriginal) || precoOriginal <= precoAtual) {
        return total
      }

      return total + (precoOriginal - precoAtual) * Number(produto.estoque)
    }, 0)

    const esperandoPreco = itens.filter(
      (produto) => Number(produto.estoque) > 0 && !(Number.isFinite(Number(produto.price)) && Number(produto.price) > 0)
    )

    const clientesEsperando = itens.reduce(
      (total, produto) => total + (clientesPorProduto[produto.id] || 0),
      0
    )

    return {
      categoria,
      valorEmEstoque,
      lucroEstimado,
      clientesEsperando,
      esperandoPreco,
    }
  })

  const esperandoPreco = (produtos || []).filter(
    (produto) => Number(produto.estoque) > 0 && !(Number.isFinite(Number(produto.price)) && Number(produto.price) > 0)
  )

  const totalValorEmEstoque = resumoPorCategoria.reduce(
    (total, categoria) => total + categoria.valorEmEstoque,
    0
  )

  const totalLucroEstimado = resumoPorCategoria.reduce(
    (total, categoria) => total + categoria.lucroEstimado,
    0
  )

  const totalClientesEspera = listaEspera.length

  return (
    <section className="painel-lojista">
      <p className="sobretitulo">Área interna</p>
      <h1>Painel do lojista</h1>

      <div className="painel-resumo">
        <div className="card-metrica">
          <span className="metric-label">Valor em estoque</span>
          <strong>{formatarMoeda(totalValorEmEstoque)}</strong>
        </div>

        <div className="card-metrica">
          <span className="metric-label">Lucro estimado</span>
          <strong>{formatarMoeda(totalLucroEstimado)}</strong>
        </div>

        <div className="card-metrica">
          <span className="metric-label">Esperando preço</span>
          <strong>{esperandoPreco.length} produtos</strong>
        </div>

        <div className="card-metrica">
          <span className="metric-label">Clientes na fila</span>
          <strong>{totalClientesEspera} pessoas</strong>
        </div>
      </div>

      <div className="painel-grid">
        <div className="painel-bloco">
          <h2>Resumo por categoria</h2>

          <div className="tabela-moldura">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Valor em estoque</th>
                  <th>Lucro estimado</th>
                  <th>Clientes esperando</th>
                </tr>
              </thead>
              <tbody>
                {resumoPorCategoria.map((item) => (
                  <tr key={item.categoria}>
                    <td>{item.categoria}</td>
                    <td>{formatarMoeda(item.valorEmEstoque)}</td>
                    <td>{formatarMoeda(item.lucroEstimado)}</td>
                    <td>{item.clientesEsperando}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="painel-bloco">
          <h2>Produtos esperando preço</h2>

          {esperandoPreco.length > 0 ? (
            <ul className="lista-simples">
              {esperandoPreco.map((produto) => (
                <li key={produto.id}>
                  <strong>{produto.title}</strong>
                  <span>{produto.category}</span>
                  <span>{produto.estoque} unidades em estoque</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="aviso">Nenhum produto está aguardando definição de preço.</p>
          )}
        </div>
      </div>

      <div className="painel-bloco painel-bloco-completo">
        <h2>Fila de espera por produto</h2>

        <div className="tabela-moldura">
          <table className="tabela">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Clientes na fila</th>
              </tr>
            </thead>
            <tbody>
              {(produtos || [])
                .filter((produto) => (clientesPorProduto[produto.id] || 0) > 0)
                .map((produto) => (
                  <tr key={produto.id}>
                    <td>{produto.title}</td>
                    <td>{produto.category}</td>
                    <td>{clientesPorProduto[produto.id] || 0}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
