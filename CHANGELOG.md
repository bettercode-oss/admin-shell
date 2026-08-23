# CHANGELOG

셸을 **가져다 쓰는 사람**을 위한 기록입니다. 재복사할 때 판단에 쓰는 것만 적습니다.

- **새 의존** — `npx shadcn add` 를 더 해야 하는가
- **공개 API** — export·props 가 바뀌어 내 코드가 깨지는가
- **복사 단위 파일 추가·삭제** — 폴더를 덮을 때 없어질 파일이 있는가
- **클래스 · CSS 변수** — 내가 덮어쓴 스타일이 어긋나는가

내부 구현만 바뀐 변경은 여기 없습니다. 전체 이력은
[커밋 로그](https://github.com/bettercode-oss/admin-shell/commits/main)를 보세요.

복사 단위와 절차는 [README](README.md#다른-프로젝트에-복사해서-쓰는-방법) 참조.

---

## Unreleased

`v0.1.0` 이후 main 에 들어간 것들입니다.

### 공개 API

- `TopbarNav` / `TopbarNavItem` 추가 ([#41]) — 토프바 수평 메뉴.
  `SidebarNavItem` 과 같은 계약이라 `icon` / `active` / `asChild` 를 그대로 받습니다
- `TopbarNavItem` 에 `emphasis?: "default" | "strong"` 추가 ([#42]) —
  섹션(대표) 항목을 굵게. 기본값이 `"default"` 라 **기존 사용처는 그대로 동작합니다**

### 새 의존

없습니다.

### 복사 단위 파일 추가·삭제

upstream 에서 늘거나 준 파일은 없습니다. 파일 10개 그대로입니다.

다만 `scripts/sync-into.sh` 로 가져오면 **소비 폴더에 `VERSION` 이 하나 생깁니다** —
어느 커밋에서 왔는지 적어두는 파일입니다. 이 저장소에는 없고 소비처에만 생기며,
다음 갱신 때 "내가 손댄 곳이 어디인지" 를 가려내는 근거가 됩니다.
자세한 것은 [README 「갱신하기」](README.md#갱신하기).

### 클래스 · CSS 변수

- 변수 추가·삭제 없습니다
- `TopbarNavItem` 의 활성 배경은 **`--admin-shell-active-mix` 를 쓰지 않습니다** — `bg-accent`
  를 그대로 씁니다. 그 변수는 사이드바 전용입니다. 값을 조정해 쓰고 있었다면 토프바 메뉴에는
  반영되지 않는다는 뜻입니다 ([#41])

### 주의 — `topbar.tsx` 만 떼어가는 경우

`topbar.tsx` 가 이제 `radix-ui`(Slot)를 씁니다 (`TopbarNavItem` 의 `asChild`). 예전에는
`cn()` 하나만 필요했습니다 ([#41]).

**폴더 전체를 복사하는 소비자에게는 변화가 없습니다.** `radix-ui` 는 `sidebar.tsx` 가
`v0.1.0` 에서도 이미 쓰고 있어 복사 단위의 의존 목록이 그대로입니다. README 가 예외로
인정하는 "단독으로 떼어갈 수 있는 파일" 목록에서 `topbar.tsx` 의 조건만 달라졌습니다.

---

## [0.1.0] — 2026-08-20

첫 릴리스. 담긴 컴포넌트 목록은 [릴리스 노트][0.1.0]에 있습니다. 이전 상태인 소비처가
없으므로 PR 별로 소급하지 않고, **재복사에 필요한 의존 목록만** 못박습니다.

### 의존

```
shadcn : button, tooltip, sheet, separator, collapsible, popover, command
         npx shadcn@latest add button tooltip sheet separator collapsible popover command
         (command 가 dialog 와 input-group 을 함께 가져옵니다)

npm    : react, lucide-react, radix-ui

기타   : cn()  — src/lib/utils.ts
         shadcn 토큰 --sidebar, --sidebar-foreground, --sidebar-accent,
                     --sidebar-border, --sidebar-ring
```

### 복사 단위 파일 (10개)

```
admin-shell.tsx   command-palette.tsx  index.ts        mobile-drawer.tsx
shell-context.tsx sidebar-collapse.tsx sidebar-styles.ts
sidebar-submenu.tsx  sidebar.tsx       topbar.tsx
```

[#41]: https://github.com/bettercode-oss/admin-shell/pull/41
[#42]: https://github.com/bettercode-oss/admin-shell/pull/42
[0.1.0]: https://github.com/bettercode-oss/admin-shell/releases/tag/v0.1.0
