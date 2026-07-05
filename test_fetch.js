async function run() {
  const r = await fetch("https://unimaisveiculos.com.br/?post_type=product&s=EUT2E69");
  console.log("URL:", r.url);
  console.log("Redirected:", r.redirected);
}
run();
