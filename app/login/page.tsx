"use client";

export default function LoginPage() {
  const handleGoToBookshelf = () => {
    window.location.href = '/bookshelf';
  };

  const handleCreateNote = () => {
    window.location.href = '/note/create';
  };

  return (
    <div className="login-page">
      {/* 品牌区域 */}
      <div className="brand-section">
        <h1 className="brand-title" style={{ fontFamily: '"Comic Sans MS", "Marker Felt", cursive' }}>BlogBook</h1>
        <p className="brand-slogan">一个私有化、高颜值、极简排版的在线图文笔记工具</p>
      </div>

      {/* 快速开始按钮 */}
      <div className="login-form">
        <button
          className="btn btn-primary"
          onClick={handleGoToBookshelf}
        >
          看看我的书架
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleCreateNote}
        >
          开始创建笔记
        </button>
      </div>


    </div>
  );
}