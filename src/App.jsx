import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router'
import Header from './components/Header'
import Footer from './components/Footer'
import RolarParaTopo from './components/RolarParaTopo'
import Loja from './pages/Loja'
import PaginaProduto from './pages/PaginaProduto'
import Carrinho from './pages/Carrinho'
import Estoque from './pages/Estoque'
import PainelLojista from './pages/PainelLojista'
import { buscarProdutos } from './services/produtos'
import { buscarClientes } from './services/clientes'

function produtoDisponivel(produto) {
  const preco = Number(produto?.price)
  return Number.isFinite(preco) && preco > 0
}

function produtoEmLoja(produto) {
  return produto && produto.estoque > 0 && produtoDisponivel(produto)
}

export default function App() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [carrinho, setCarrinho] = useState([])
  const [clientes, setClientes] = useState([])
  const [clienteAtualId, setClienteAtualId] = useState(null)
  const [listaEspera, setListaEspera] = useState([])

  useEffect(() => {
    buscarProdutos()
      .then((dados) => setProdutos(dados))
      .catch(() => setErro('Não foi possível carregar os produtos.'))
      .finally(() => setCarregando(false))

    buscarClientes().then((dados) => {
      setClientes(dados)

      if (dados.length === 0) {
        return
      }

      const clientePadrao =
        dados.find((cliente) => Number(cliente?.pedidosAnteriores ?? 0) > 0) ??
        dados.find((cliente) => Number(cliente?.pedidosAnteriores ?? 0) === 0) ??
        dados[0]

      setClienteAtualId(clientePadrao.id)
    })
  }, [])

  function adicionarAoCarrinho(produto) {
    if (!produto || !produtoDisponivel(produto) || produto.estoque === 0) {
      return
    }

    setCarrinho((anterior) => anterior.concat(produto))
  }

  function removerUmaUnidade(produtoId) {
    // Remove só a primeira unidade encontrada do produto
    let removido = false
    setCarrinho((anterior) =>
      anterior.filter((produto) => {
        if (!removido && produto.id === produtoId) {
          removido = true
          return false
        }
        return true
      })
    )
  }

  function pedirAvisoProduto(produtoId, dadosCliente) {
    setListaEspera((anterior) => {
      const jaExiste = anterior.some(
        (item) => item.produtoId === produtoId && item.email === dadosCliente.email
      )

      if (jaExiste) {
        return anterior
      }

      return [...anterior, { produtoId, nome: dadosCliente.nome, email: dadosCliente.email }]
    })
  }

  const clienteAtual = clientes.find((cliente) => cliente.id === clienteAtualId)
  const produtosVendaveis = produtos.filter((produto) => produtoEmLoja(produto))

  return (
    <div className="app">
      <RolarParaTopo />
      <Header carrinho={carrinho} clienteAtual={clienteAtual} />

      <main className="conteudo">
        {carregando && <p className="aviso">Carregando produtos...</p>}
        {erro && <p className="aviso aviso-erro">{erro}</p>}

        {!carregando && !erro && (
          <Routes>
            <Route
              path="/"
              element={<Loja produtos={produtosVendaveis} onAdicionar={adicionarAoCarrinho} />}
            />
            <Route
              path="/produto/:id"
              element={
                <PaginaProduto
                  produtos={produtos}
                  onAdicionar={adicionarAoCarrinho}
                  onSolicitarAviso={pedirAvisoProduto}
                />
              }
            />
            <Route
              path="/carrinho"
              element={
                <Carrinho
                  carrinho={carrinho}
                  produtos={produtosVendaveis}
                  clienteAtual={clienteAtual}
                  onAdicionar={adicionarAoCarrinho}
                  onRemover={removerUmaUnidade}
                />
              }
            />
            <Route
              path="/lojista"
              element={<PainelLojista produtos={produtos} listaEspera={listaEspera} />}
            />
            <Route
              path="/estoque"
              element={<Estoque produtos={produtos} listaEspera={listaEspera} />}
            />
          </Routes>
        )}
      </main>

      <Footer
        clientes={clientes}
        clienteAtualId={clienteAtualId}
        onTrocarCliente={setClienteAtualId}
      />
    </div>
  )
}
