export default function NomineeDetailsModal({ nominee, onClose }) {
  const printDetails = () => {
    const win = window.open("", "_blank");
    if (!win) {
      return;
    }
    const rows = [
      ["Nomination ID", nominee.nominationId],
      ["Name", nominee.name],
      ["Email", nominee.email],
      ["Mobile", nominee.mobile],
      ["WhatsApp", nominee.whatsapp],
      ["Gender", nominee.gender],
      ["Division", nominee.division],
      ["District", nominee.district],
      ["Main Category", nominee.mainCategory],
      ["Sub-Category", nominee.category],
      ["Facebook Profile", nominee.fbProfile],
      ["Facebook Page", nominee.fbPage],
      ["About", nominee.about],
      ["Payment Method", nominee.paymentMethod],
      ["Payment Number", nominee.paymentNumber],
      ["Transaction ID", nominee.trxId],
      ["Payment Amount", nominee.paymentAmount],
      ["Status", nominee.status],
      ["Vote Count", nominee.voteCount],
      ["Google Drive Video", nominee.googleDriveVideoLink],
      ["Facebook Video", nominee.facebookVideoLink],
    ];
    win.document.write(`
      <html><head><title>${nominee.name} — ${nominee.nominationId}</title>
      <style>body{font-family:Arial;padding:24px;color:#222}h1{color:#b8860b}table{border-collapse:collapse;width:100%;margin-top:14px}td{border:1px solid #ccc;padding:8px;font-size:13px}td:first-child{background:#fff7e0;font-weight:bold;width:35%}img{max-width:160px;border:2px solid #b8860b;border-radius:8px}a{color:#0066cc}</style>
      </head><body>
      <h1>National Tech Award — Nominee Details</h1>
      ${nominee.photo ? `<img src="${nominee.photo}" alt="${nominee.name}" />` : ""}
      <table>${rows.map(([label, value]) => `<tr><td>${label}</td><td>${typeof value == "string" && value.startsWith("http") ? `<a href="${value}" target="_blank">${value}</a>` : (value ?? "")}</td></tr>`).join("")}</table>
      </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4 animate-fade-in"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-amber-500/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-black border-b border-amber-500/20 p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-amber-500">{nominee.name}</h3>
          <div className="flex gap-2">
            <button
              onClick={printDetails}
              className="text-xs bg-amber-500 text-black font-bold px-3 py-2 rounded"
            >
              <i className="fas fa-print mr-1" />
              Print
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white px-3 py-2"
            >
              <i className="fas fa-times" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            {nominee.photo && (
              <img
                src={nominee.photo}
                alt={nominee.name}
                className="w-32 h-32 rounded-xl object-cover border-2 border-amber-500/50"
              />
            )}
            <div>
              <p className="text-amber-400 font-mono text-sm">
                {nominee.nominationId}
              </p>
              <p className="text-2xl font-bold text-white">{nominee.name}</p>
              <p className="text-gray-400 text-sm">
                {nominee.mainCategory}
                {" · "}
                {nominee.category}
              </p>
              <p className="text-amber-500 mt-2">
                {"Votes: "}
                {nominee.voteCount || 0}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Email", nominee.email],
              ["Mobile", nominee.mobile],
              ["WhatsApp", nominee.whatsapp],
              ["Gender", nominee.gender],
              ["Division", nominee.division],
              ["District", nominee.district],
              ["Facebook Profile", nominee.fbProfile],
              ["Facebook Page", nominee.fbPage],
              ["Payment Method", nominee.paymentMethod],
              ["Payment Number", nominee.paymentNumber],
              ["Transaction ID", nominee.trxId],
              ["Payment Amount", nominee.paymentAmount],
              ["Status", nominee.status],
              ["Google Drive Video", nominee.googleDriveVideoLink],
              ["Facebook Video", nominee.facebookVideoLink],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-900/50 p-3 rounded-lg">
                <p className="text-[10px] uppercase text-gray-500 font-bold">
                  {label}
                </p>
                {typeof value == "string" && value.startsWith("http") ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 text-sm break-all hover:underline"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-white text-sm break-all">{value || "-"}</p>
                )}
              </div>
            ))}
            {nominee.about && (
              <div className="bg-gray-900/50 p-3 rounded-lg col-span-2">
                <p className="text-[10px] uppercase text-gray-500 font-bold">
                  About
                </p>
                <p className="text-white text-sm whitespace-pre-wrap">
                  {nominee.about}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
