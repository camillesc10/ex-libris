"use client";
import { useState } from "react";
import { useStore } from "@/store";
import type { Book } from "@/types";

interface Friend {
  name: string;
  initial: string;
  avatarBg: string;
}

const FRIENDS: Friend[] = [
  { name: "Camille", initial: "C", avatarBg: "#C4735C" },
];

function MiniCover({ book, onOpen }: { book: Book; onOpen: (id: string) => void }) {
  return (
    <button
      onClick={() => onOpen(book.id)}
      title={`${book.title} — ${book.author}`}
      style={{
        flexShrink: 0, width: 52, height: 76,
        borderRadius: "2px 8px 8px 2px",
        borderLeft: "3px solid rgba(224,184,74,.7)",
        outline: "1px solid rgba(224,184,74,.22)", outlineOffset: -4,
        background: book.bg, color: book.ink,
        fontFamily: "var(--font-cinzel, Cinzel, serif)", fontSize: 9,
        padding: "6px 5px", lineHeight: 1.22, textAlign: "left",
        boxShadow: "0 6px 16px -8px rgba(0,0,0,.55)",
        transition: "transform .15s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
    >
      {book.title}
    </button>
  );
}

interface SectionProps {
  title: string;
  sectionBooks: Book[];
  emptyMsg: string;
  accentColor: string;
  onOpen: (id: string) => void;
}

function Section({ title, sectionBooks, emptyMsg, accentColor, onOpen }: SectionProps) {
  return (
    <div style={{
      border: "1px solid var(--line)", borderRadius: 18,
      padding: "20px 22px", background: "var(--surface)",
      marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <h2 style={{
          fontFamily: "var(--font-cinzel, Cinzel, serif)", fontWeight: 400,
          fontSize: 17, margin: 0, letterSpacing: ".02em",
        }}>
          {title}
        </h2>
        <span style={{
          fontSize: 12, color: accentColor,
          background: "var(--soft)", borderRadius: 999,
          padding: "2px 10px", fontWeight: 700,
        }}>
          {sectionBooks.length}
        </span>
      </div>

      {sectionBooks.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>
          {emptyMsg}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {sectionBooks.map((b) => (
            <div key={b.id} style={{ flexShrink: 0 }}>
              <MiniCover book={b} onOpen={onOpen} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LibraryCompareScreen() {
  const { books, openBook } = useStore();
  const [selectedFriend, setSelectedFriend] = useState<string>("Camille");

  // Camille's read list: fixed seed of the first 5 book IDs
  const friendReadIds = new Set(books.slice(0, 5).map((b) => b.id));
  const myReadIds = new Set(books.filter((b) => b.lists.includes("Déjà lu")).map((b) => b.id));

  const inCommon = books.filter((b) => friendReadIds.has(b.id) && myReadIds.has(b.id));
  const friendOnly = books.filter((b) => friendReadIds.has(b.id) && !myReadIds.has(b.id));
  const myOnly = books.filter((b) => myReadIds.has(b.id) && !friendReadIds.has(b.id));

  const friend = FRIENDS.find((f) => f.name === selectedFriend) ?? FRIENDS[0];

  return (
    <div style={{ padding: "30px 38px" }} className="max-[820px]:!px-[18px] max-[820px]:!py-[22px]">

      {/* Heading */}
      <h1 style={{
        fontFamily: "var(--font-cinzel, Cinzel, serif)", fontWeight: 400,
        fontSize: 26, letterSpacing: ".03em", margin: "0 0 6px",
      }}>
        Comparaison de bibliothèques
      </h1>
      <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 28px" }}>
        Découvrez ce que vous avez lu en commun — et ce qui vous manque.
      </p>

      {/* ── Friend picker ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
          color: "var(--muted)", marginBottom: 12,
        }}>
          Comparer avec
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {FRIENDS.map((f) => {
            const active = selectedFriend === f.name;
            return (
              <button
                key={f.name}
                onClick={() => setSelectedFriend(f.name)}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "9px 16px", borderRadius: 999, minHeight: 44,
                  border: `1.5px solid ${active ? "var(--accent)" : "var(--line)"}`,
                  background: active ? "var(--soft)" : "transparent",
                  color: active ? "var(--accent)" : "var(--ink)",
                  cursor: "pointer", transition: "all .12s",
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: f.avatarBg, color: "#fff",
                  display: "grid", placeItems: "center",
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {f.initial}
                </div>
                <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{f.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Stats overview ── */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { label: "En commun", value: inCommon.length, color: "#7DB08A" },
          { label: `${friend.name} seulement`, value: friendOnly.length, color: "#C4735C" },
          { label: "Toi seulement", value: myOnly.length, color: "#8A9BC1" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              flex: "1 1 110px", minWidth: 100, padding: "16px 18px",
              border: "1px solid var(--line)", borderRadius: 14,
              background: "var(--surface)",
            }}
          >
            <div style={{
              fontSize: 30, fontWeight: 700, color: stat.color,
              lineHeight: 1, marginBottom: 5,
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Three comparison sections ── */}
      <Section
        title="En commun"
        sectionBooks={inCommon}
        emptyMsg={`Ni toi ni ${friend.name} n'avez encore les mêmes lectures terminées.`}
        accentColor="var(--accent)"
        onOpen={openBook}
      />
      <Section
        title={`${friend.name} a lu, pas toi`}
        sectionBooks={friendOnly}
        emptyMsg={`Tu as déjà lu tout ce qu'elle a lu — ou sa bibliothèque est encore vide.`}
        accentColor="#C4735C"
        onOpen={openBook}
      />
      <Section
        title="Tu as lu, pas elle"
        sectionBooks={myOnly}
        emptyMsg={`Tout ce que tu as lu figure aussi dans sa bibliothèque.`}
        accentColor="#8A9BC1"
        onOpen={openBook}
      />
    </div>
  );
}
