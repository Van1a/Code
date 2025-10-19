export const metadata = {
  title: "Nerium API",
  description: "Very reliable when it comes to Game Code — supported more than 300+ Games!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
