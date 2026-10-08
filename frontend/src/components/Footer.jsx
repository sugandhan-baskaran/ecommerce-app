const Footer = () => (
  <footer className="bg-ink text-white mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row justify-between gap-5">
      <div><p className="text-2xl font-bold">shop<span className="text-coral">ease</span>.</p><p className="text-white/60 text-sm mt-2">Useful things, beautifully considered.</p></div>
      <p className="text-white/50 text-sm self-end">© {new Date().getFullYear()} ShopEase · Built with React, Node.js &amp; MongoDB</p>
    </div>
  </footer>
);

export default Footer;
