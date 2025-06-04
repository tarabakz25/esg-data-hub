export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">TailwindCSS Test</h1>
        <p className="text-gray-600 mb-6">
          このページでスタイルが正しく表示されていれば、TailwindCSSが動作しています。
        </p>
        <div className="space-y-3">
          <div className="w-full h-4 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full"></div>
          <div className="w-3/4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
          <div className="w-1/2 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
        </div>
        <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
          スタイル確認ボタン
        </button>
      </div>
    </div>
  );
} 