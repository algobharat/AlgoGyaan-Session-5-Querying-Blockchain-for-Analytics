import BlockDetails from './components/BlockDetails'
import AlgorandExplorer from './components/AlgorandExplorer'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Algorand Explorer</h1>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Block Explorer</h2>
          <BlockDetails />
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Transaction and Asset Explorer</h2>
          <AlgorandExplorer />
        </section>
      </div>
    </main>
  )
}

