export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          テストページ
        </h1>
        <p className="text-gray-600 mb-4">
          このページが表示されていれば、Next.jsとTailwindCSSが正常に動作しています。
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ 動作確認成功！
        </div>
      </div>
    </div>
  );
} 