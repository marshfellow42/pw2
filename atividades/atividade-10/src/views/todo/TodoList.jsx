import React, { useEffect, useState } from 'react'
import IconButton from '../template/IconButton'
import axios from 'axios'

const TodoList = props => {
    const [list, setList] = useState([]);

    const fetchList = () => {
        axios.get("https://mauricio.inf.br/p6/api/list/")
            .then(resp => {
                setList(resp.data.veiculos);
            })
            .catch(err => console.error('Erro em pegar os dados:', err));
    };

    useEffect(() => {
        fetchList();
    }, []);

    const removeRow = async (placa) => {
        try {
            const formData = new FormData();
            formData.append('placa', placa);

            const response = await axios.post('https://mauricio.inf.br/p6/api/remove/', formData);
            console.log('Resposta da API externa:', response.data);

            fetchList();
        } catch (err) {
            console.error('Erro no axios:', err);
        }
    };

    const renderRows = () => {
        return list.map((todo, index) => (
            <tr key={index}>
                <td>{todo.placa}</td>
                <td>{todo.marca}</td>
                <td>{todo.modelo}</td>
                <td>{todo.cor}</td>
                <td>{todo.ano_fabric}</td>
                <td>
                    <IconButton btnStyle='danger' icon='trash-o' onClick={() => removeRow(todo.placa)} />
                </td>
            </tr>
        ));
    };

    return (
        <table className='table'>
            <thead>
                <tr>
                    <th>Placa</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Cor</th>
                    <th>Ano de Fábrica</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    );
}

export default TodoList;
