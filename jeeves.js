// ==========================================
// Author  : If you like content like this, you can join this channel. 📲
// Contact : https://t.me/jieshuo_materials
// ==========================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- 1. Ambil Parameter ---
    // Support ?prompt=..., ?message=..., atau ?q=...
    const prompt = url.searchParams.get('prompt') || url.searchParams.get('message') || url.searchParams.get('q');

    // --- 2. Helper Response JSON (Template AngelaImut) ---
    const jsonResponse = (data, status = 200) => {
      return new Response(JSON.stringify(data, null, 2), {
        status: status,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*', // Biar bisa ditembak dari mana aja
          'User-Agent': 'AngelaImut-Worker'
        }
      });
    };

    // --- 3. Cek Input ---
    if (!prompt) {
      return jsonResponse({
        status: true,
        author: "AngelaImut",
        message: "Jeeves AI Wrapper Ready!",
        usage: `${url.origin}/?prompt=Buatkan+ide+konten+instagram`
      });
    }

    try {
      // --- 4. Tembak API Target ---
      const targetUrl = `https://labs.shannzx.xyz/api/v1/jeeves?prompt=${encodeURIComponent(prompt)}`;
      
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Gagal akses API Jeeves: ${response.status}`);
      }

      const rawData = await response.json();

      // --- 5. Validasi Data dari Source ---
      if (!rawData.status || !rawData.data) {
        throw new Error("Respon API kosong atau format berubah.");
      }

      // --- 6. Output Final ---
      return jsonResponse({
        status: true,
        author: "AngelaImut",
        model: "jeeves-ai",
        result: rawData.data.answer, // Langsung ambil poin jawabannya
        meta: {
          message_id: rawData.data.messageId,
          source: "Shannz Labs"
        }
      });

    } catch (error) {
      return jsonResponse({
        status: false,
        author: "AngelaImut",
        error: error.message
      }, 500);
    }
  }
};