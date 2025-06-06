import './TabelaProdutos.css'
import React, { useState } from "react";
import produtosOriginais from '../../data/produtos'

export default function TabelaProdutos() {
    const [produtos, setProdutos] = useState(produtosOriginais)

    const softDelete = (id) => {
        const atualizados = produtos.map(p =>
            p.id === id ? {...p, softDelete: 1 } : p
        )
        setProdutos(atualizados)
    };

    function getLinhas(){
        return produtos
            .filter(produtos => produtos.softDelete !== 1)
            .map((produto, i) => (
                <tr key={produto.id} className={i % 2 === 0 ? 'Par' : 'Impar'}>
                    <td>{produto.id}</td>
                    <td>{produto.nome}</td>
                    <td>R$ {produto.preco.toFixed(2).replace('.', ',')}</td>
                    <td>
                        <button onClick={() => softDelete(produto.id)}>
                            Deletar
                        </button>
                    </td>
                </tr>
            ))
    }

    return (
        <div className="TabelaProdutos">
            <table border="1">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Deletar</th>
                </tr>
                </thead>
                <tbody>
                    {getLinhas()}
                </tbody>
            </table>
        </div>
    )
}