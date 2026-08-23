#!/bin/sh
# admin-shell 복사 단위를 소비 프로젝트로 복사하고, 출처를 VERSION 에 기록한다.
#
#   scripts/sync-into.sh ../admin
#   scripts/sync-into.sh --force ../admin
#
# npm 패키지가 아니라 파일을 복사해 쓰는 방식이라(README 「복사해서 쓰는 방법」),
# 소비처는 자기 폴더가 어느 커밋에서 왔는지 알 방법이 없었다. 그래서 재복사할 때
# **소비처가 손댄 부분이 조용히 사라질 수 있다.** 이 스크립트가 막는 것이 그것이다.
#
# 핵심은 3단계다. upstream 이 앞서 있으면 폴더끼리 비교해봐야 어차피 다르므로,
# **소비 폴더를 그 폴더가 왔다고 기록된 커밋의 트리와** 비교해야 로컬 수정분만 잡힌다.

set -eu

UNIT="src/components/admin-shell"
REPO=$(cd "$(dirname "$0")/.." && pwd)
SRC="$REPO/$UNIT"

FORCE=0
FROM=""
TARGET=""

usage() {
  cat <<'USAGE'
사용법: scripts/sync-into.sh [--force] <소비 프로젝트 경로> [복사 단위 상대경로]

  <소비 프로젝트 경로>   소비 프로젝트의 루트. 기본으로 src/components/admin-shell 에 넣는다
  [복사 단위 상대경로]   폴더 위치가 다르면 지정 (예: app/components/admin-shell)
  --from <커밋>         VERSION 이 아직 없는 폴더의 출처를 알려준다. 손으로 복사해 쓰던
                       소비처를 넘겨받을 때 쓴다 — 이걸 주면 로컬 수정분 검사를 할 수 있다
  --force              로컬 수정분이 있어도 덮는다. 출처를 알 수 없을 때도 필요하다
USAGE
}

while [ $# -gt 0 ]; do
  case "$1" in
    -f|--force) FORCE=1 ;;
    --from) shift; [ $# -gt 0 ] || { echo "--from 에 커밋이 없다" >&2; exit 2; }; FROM="$1" ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "모르는 옵션: $1" >&2; usage >&2; exit 2 ;;
    *) if [ -z "$TARGET" ]; then TARGET="$1"; else UNIT="$1"; fi ;;
  esac
  shift
done

[ -n "$TARGET" ] || { usage >&2; exit 2; }
[ -d "$SRC" ] || { echo "복사 단위가 없다: $SRC" >&2; exit 1; }
[ -d "$TARGET" ] || { echo "소비 프로젝트 경로가 없다: $TARGET" >&2; exit 1; }

DEST="$(cd "$TARGET" && pwd)/$UNIT"

# 지금 트리가 지저분하면 VERSION 에 적을 커밋이 실제 내용과 다르다.
if [ -n "$(git -C "$REPO" status --porcelain -- "$UNIT")" ] && [ "$FORCE" -eq 0 ]; then
  echo "복사 단위에 커밋되지 않은 변경이 있다. VERSION 이 실제 내용과 어긋난다." >&2
  git -C "$REPO" status --short -- "$UNIT" >&2
  echo "커밋한 뒤 다시 하거나 --force 로 진행할 것." >&2
  exit 1
fi

HEAD_SHA=$(git -C "$REPO" rev-parse --short HEAD)
REF=$(git -C "$REPO" describe --tags --exact-match HEAD 2>/dev/null \
      || git -C "$REPO" rev-parse --abbrev-ref HEAD)

# VERSION 에 적는 커밋은 **나중에도 존재해야** 한다. 다음 갱신 때 그 커밋의 트리와
# 비교해 로컬 수정분을 가려내기 때문이다.
#
# 이 저장소는 squash-merge 를 쓴다. 그래서 기능 브랜치의 tip 은 머지된 뒤 main 이력에
# 남지 않는다. 그런 SHA 를 적으면 다음 갱신 때
#   - 신선한 클론에서는 커밋 자체를 못 찾고
#   - 로컬에 남아 있어도 이미 가진 변경이 "새로 들어온 것" 으로 다시 세어진다
# 그래서 main 에 들어간 커밋이나 태그에서만 복사한다.
BASE=${SYNC_BASE:-origin/main}
if git -C "$REPO" describe --tags --exact-match HEAD >/dev/null 2>&1; then
  :  # 태그는 영구적이다
elif ! git -C "$REPO" rev-parse --verify --quiet "$BASE" >/dev/null 2>&1; then
  echo "경고: $BASE 를 찾을 수 없어 출처 커밋이 오래 남는지 확인하지 못했다." >&2
elif ! git -C "$REPO" merge-base --is-ancestor HEAD "$BASE" 2>/dev/null; then
  echo "지금 HEAD($HEAD_SHA, $REF)는 $BASE 에 들어가 있지 않다."
  echo "이 저장소는 squash-merge 라 브랜치 커밋은 머지 뒤 main 이력에서 사라진다."
  echo "VERSION 에 적으면 다음 갱신 때 기준점을 잃는다 — 머지한 뒤 main 에서 다시 실행할 것."
  echo "(그래도 지금 복사하려면 --force)"
  [ "$FORCE" -eq 1 ] || exit 1
fi
ORIGIN=$(git -C "$REPO" remote get-url origin 2>/dev/null | sed 's/\.git$//' \
         || echo "https://github.com/bettercode-oss/admin-shell")
TODAY=$(date +%Y-%m-%d)

echo "출처  $REF ($HEAD_SHA)"
echo "대상  $DEST"
echo

# ── 최초 도입 ─────────────────────────────────────────────────────────
if [ ! -d "$DEST" ]; then
  echo "대상 폴더가 없다 — 최초 도입으로 본다."
  mkdir -p "$DEST"
else
  # 안전장치. 엉뚱한 경로를 지우지 않는다.
  [ -f "$DEST/index.ts" ] || {
    echo "$DEST 가 admin-shell 복사 단위로 보이지 않는다 (index.ts 없음)." >&2
    echo "경로를 확인할 것. 최초 도입이라면 빈 폴더를 지우고 다시 실행한다." >&2
    exit 1
  }

  OLD=""
  [ -f "$DEST/VERSION" ] && OLD=$(awk '$1=="commit"{print $2}' "$DEST/VERSION")
  # VERSION 이 없는 폴더(손으로 복사하던 시절의 소비처)는 --from 으로 출처를 알려준다.
  [ -z "$OLD" ] && OLD="$FROM"

  if [ -z "$OLD" ]; then
    echo "대상에 VERSION 이 없다 — 어느 커밋에서 왔는지 알 수 없다."
    echo "출처를 안다면 --from <커밋> 으로 알려주면 로컬 수정분을 확인할 수 있다."
    echo "모른다면 --force 로 진행한다(확인 없이 덮는다)."
    [ "$FORCE" -eq 1 ] || exit 1
  elif ! git -C "$REPO" cat-file -e "$OLD^{commit}" 2>/dev/null; then
    echo "VERSION 이 가리키는 커밋 $OLD 가 이 저장소에 없다 (얕은 클론이거나 다른 곳에서 왔다)."
    echo "로컬 수정분을 확인할 수 없으므로 --force 가 필요하다."
    [ "$FORCE" -eq 1 ] || exit 1
  else
    # ── 로컬 수정분 검출 ───────────────────────────────────────────
    # upstream 이 앞서 있으면 폴더끼리 비교해봐야 어차피 다르다.
    # 대상이 "왔다고 기록된 커밋" 의 트리와 다른 부분만이 소비처가 손댄 것이다.
    TMP=$(mktemp -d)
    trap 'rm -rf "$TMP"' EXIT INT TERM
    git -C "$REPO" archive "$OLD" "$UNIT" | tar -x -C "$TMP"

    if diff -r -q -x VERSION "$TMP/$UNIT" "$DEST" > "$TMP/drift" 2>&1; then
      echo "로컬 수정분 없음 ($OLD 그대로)."
    else
      echo "!! 대상에 로컬 수정분이 있다. 덮으면 사라진다."
      sed "s|$TMP/$UNIT|upstream($OLD)|; s|$DEST|대상|" "$TMP/drift"
      if [ "$FORCE" -eq 0 ]; then
        echo
        echo "확인한 뒤 --force 로 다시 실행하거나, 수정분을 upstream 에 올릴 것." >&2
        exit 1
      fi
      echo "--force — 그대로 덮는다."
    fi

    # ── 그 사이 무엇이 바뀌었나 ────────────────────────────────────
    echo
    LOG=$(git -C "$REPO" log --oneline "$OLD..HEAD" -- "$UNIT")
    if [ -z "$LOG" ]; then
      echo "$OLD 이후 복사 단위에 바뀐 것이 없다."
    else
      echo "$OLD 이후 복사 단위 변경:"
      echo "$LOG" | sed 's/^/  /'
    fi
  fi

  rm -rf "$DEST"
  mkdir -p "$DEST"
fi

# ── 복사 ──────────────────────────────────────────────────────────────
cp "$SRC"/*.ts "$SRC"/*.tsx "$DEST/"

cat > "$DEST/VERSION" <<EOF
source   $ORIGIN
ref      $REF
commit   $HEAD_SHA
date     $TODAY
EOF

echo
echo "복사 완료. VERSION 을 기록했다."
echo
echo "다음: CHANGELOG 에서 새로 설치할 shadcn 컴포넌트가 있는지 확인할 것."
echo "  $ORIGIN/blob/main/CHANGELOG.md"
