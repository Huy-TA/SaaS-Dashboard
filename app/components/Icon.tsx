import { ICON_SPRITE, type IconName } from '@/lib/icons';

/* Sprite nạp MỘT lần ở app/layout.tsx; mọi chỗ khác chỉ gọi <use>.
   dangerouslySetInnerHTML an toàn: nội dung là hằng số trong repo. */
export function IconSprite() {
  return (
    <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden
         dangerouslySetInnerHTML={{ __html: ICON_SPRITE }} />
  );
}

export function Icon({ name, className = 'lu' }: { name: IconName; className?: string }) {
  return <svg className={className} aria-hidden><use href={`#i-${name}`} /></svg>;
}
