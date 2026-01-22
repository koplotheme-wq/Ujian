export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    try {
      const url = new URL(request.url);      
      // 1. INPUT HANDLING
      // Mendukung parameter 'message', 'q', 'question', atau 'text'
      let question = url.searchParams.get("message") || url.searchParams.get("q") || url.searchParams.get("question") || url.searchParams.get("text");
      if (request.method === "POST") {
        try {
          const body = await request.json();
          if (body.message) question = body.message;
          if (body.question) question = body.question;
          if (body.text) question = body.text;
        } catch (e) {}
      }
      if (!question) {
        return new Response(JSON.stringify({
          status: true,
          creator: "MifNity",
          message: "Blackbox AI Ready. Kirim parameter 'message' untuk bertanya.",
        }, null, 2), { headers: corsHeaders });
      }
      // 2. EKSEKUSI KE TAKAMURA
      // Kita gunakan encodeURIComponent agar simbol-simbol (seperti ?, &, +) aman di URL
      const targetUrl = `https://takamura.site/api/ai/blackbox?question=${encodeURIComponent(question)}`;      
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (!response.ok) throw new Error(`Server Error: ${response.status}`);
      const data = await response.json();
      // 3. CLEANING OUTPUT
      // Kita ambil bagian 'answer' saja.
      const resultText = data.answer || "Tidak ada jawaban dari server.";
      return new Response(JSON.stringify({
        status: true,
        creator: "MifNity",
        original_question: question,
        result: resultText
      }, null, 2), { status: 200, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({
        status: false,
        creator: "MifNity",
        error: error.message
      }, null, 2), { status: 500, headers: corsHeaders });
    }
  }
};
