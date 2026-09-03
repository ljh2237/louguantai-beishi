"use client";

// B 站视频播放器（iframe 嵌入，响应式 16:9，懒加载）
export function BilibiliPlayer({ bvid }: { bvid: string }) {
  if (!bvid) return null;
  // B 站官方播放器 iframe，外部 URL 不经过 basePath
  const embedUrl = `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&autoplay=0`;
  return (
    <div className="relative w-full overflow-hidden rounded-md bg-ink-900" style={{ aspectRatio: "16 / 9" }}>
      <iframe
        src={embedUrl}
        title="哔哩哔哩播放器"
        className="absolute inset-0 h-full w-full"
        loading="lazy"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
