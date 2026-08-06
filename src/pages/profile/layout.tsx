// app/profile/layout.tsx
"use client";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* sidebar/menu */}

      <div>{children}</div>
    </div>
  );
}
