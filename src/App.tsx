import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold text-red-600 mb-4">Aviso Importante</h1>
        <p className="mb-4">
          O ambiente foi reiniciado e o código do projeto precisa ser reimportado do seu repositório GitHub.
        </p>
        <p>
          Para corrigir o erro de tela branca no Vercel (que é causado por cache do arquivo index.html apontando para arquivos JS antigos), siga as instruções no chat.
        </p>
      </div>
    </div>
  );
}
