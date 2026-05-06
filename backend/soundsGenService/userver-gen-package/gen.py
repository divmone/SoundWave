#!/usr/bin/env python3
"""
Генератор файлов из пользовательских шаблонов.

Шаблоны лежат в папке templates/ рядом со скриптом.
Переменные пишутся как {{VAR_NAME}}.

Первая строка шаблона может задавать имя выходного файла:
  ##output: {{SERVICE_NAME}}.hpp

Автоматические переменные:
  {{HANDLER_NAME}}   OrderHandler
  {{HANDLER_LOWER}}  order
  {{HANDLER_KEBAB}}  handler-order
  {{SERVICE_NAME}}   OrderService
  {{SERVICE_FIELD}}  orderService
  {{SERVICE_NS}}     shop::services
  {{DATE}}           2026-05-03

Примеры:
  python gen.py OrderHandler
  python gen.py OrderHandler --template Service
  python gen.py OrderHandler --template Handler --template Service
  python gen.py OrderHandler --service-ns billing::services --out-dir src/
  python gen.py OrderHandler --var AUTHOR=ivan
  python gen.py --list-templates
  python gen.py --list-vars Service.hpp
"""

import argparse
import re
import sys
from datetime import date
from pathlib import Path

TEMPLATES_DIR = Path(__file__).parent / "templates"
VAR_RE = re.compile(r"\{\{(\w+)\}\}")
OUTPUT_RE = re.compile(r"^##output:\s*(.+)$")


# ── имена ────────────────────────────────────────────────────────

def to_kebab(name: str) -> str:
    base = name.removesuffix("Handler")
    result = []
    for i, ch in enumerate(base):
        if ch.isupper() and i > 0:
            result.append("-")
        result.append(ch.lower())
    return "handler-" + "".join(result)

def to_lower(name: str) -> str:
    return name.removesuffix("Handler").lower()

def build_auto_vars(handler_name: str, service_ns: str) -> dict:
    service_name = handler_name.removesuffix("Handler") + "Service"
    service_field = service_name[0].lower() + service_name[1:]
    return {
        "HANDLER_NAME":  handler_name,
        "HANDLER_LOWER": to_lower(handler_name),
        "HANDLER_KEBAB": to_kebab(handler_name),
        "SERVICE_NAME":  service_name,
        "SERVICE_FIELD": service_field,
        "SERVICE_NS":    service_ns,
        "DATE":          date.today().isoformat(),
    }


# ── шаблоны ──────────────────────────────────────────────────────

def parse_template(path: Path) -> tuple[str | None, str]:
    """Возвращает (output_pattern | None, body)."""
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    if lines and OUTPUT_RE.match(lines[0]):
        output_pattern = OUTPUT_RE.match(lines[0]).group(1).strip()
        body = "".join(lines[1:])
        return output_pattern, body
    return None, text

def apply(text: str, variables: dict) -> tuple[str, list]:
    missing = []
    def replace(m):
        key = m.group(1)
        if key not in variables:
            missing.append(key)
            return m.group(0)
        return variables[key]
    return VAR_RE.sub(replace, text), list(dict.fromkeys(missing))

def list_vars(path: Path) -> list:
    _, body = parse_template(path)
    return list(dict.fromkeys(VAR_RE.findall(body)))

def resolve_templates(names: list[str] | None) -> list[Path]:
    """None = все шаблоны. Иначе ищем по имени (с расширением или без)."""
    all_templates = sorted(TEMPLATES_DIR.glob("*"))
    if not names:
        return all_templates
    result = []
    for name in names:
        # попробуем точное совпадение, потом по stem
        candidates = [t for t in all_templates
                      if t.name == name or t.stem == name]
        if not candidates:
            print(f"⚠️  Шаблон не найден: '{name}'", file=sys.stderr)
            print(f"   Доступные: {', '.join(t.name for t in all_templates)}", file=sys.stderr)
            sys.exit(1)
        result.extend(candidates)
    return result


# ── команды ──────────────────────────────────────────────────────

def cmd_list_templates():
    templates = sorted(TEMPLATES_DIR.glob("*"))
    if not templates:
        print(f"Папка шаблонов пуста: {TEMPLATES_DIR}")
        return
    print(f"Шаблоны в {TEMPLATES_DIR}/\n")
    for t in templates:
        output_pattern, _ = parse_template(t)
        vars_ = list_vars(t)
        output_str = f"→ {output_pattern}" if output_pattern else "→ (имя по умолчанию)"
        print(f"  {t.name:<25} {output_str}")
        if vars_:
            print(f"  {'':25} переменные: {', '.join(vars_)}")
        print()

def cmd_list_vars(template_name: str):
    path = Path(template_name)
    if not path.exists():
        path = TEMPLATES_DIR / template_name
    if not path.exists():
        print(f"Шаблон не найден: {template_name}", file=sys.stderr)
        sys.exit(1)
    output_pattern, _ = parse_template(path)
    vars_ = list_vars(path)
    print(f"Шаблон: {path.name}")
    if output_pattern:
        print(f"Имя файла: {output_pattern}")
    print(f"\nПеременные:")
    for v in vars_:
        print(f"  {{{{{v}}}}}")

def cmd_generate(handler_name: str, service_ns: str,
                 out_dir: Path, extra_vars: dict, template_names: list[str] | None):
    templates = resolve_templates(template_names)
    if not templates:
        print(f"❌  Нет шаблонов в {TEMPLATES_DIR}", file=sys.stderr)
        sys.exit(1)

    variables = build_auto_vars(handler_name, service_ns) | extra_vars
    out_dir.mkdir(parents=True, exist_ok=True)

    for tmpl in templates:
        output_pattern, body = parse_template(tmpl)

        # имя выходного файла
        if output_pattern:
            filename, missing_name = apply(output_pattern, variables)
            if missing_name:
                print(f"⚠️  {tmpl.name}: неизвестные переменные в ##output: {missing_name}")
        else:
            # fallback: заменяем "Handler" в имени шаблона
            filename = tmpl.stem.replace("Handler", handler_name) + tmpl.suffix

        result, missing = apply(body, variables)
        if missing:
            print(f"⚠️  {tmpl.name}: незаполненные переменные: {', '.join(missing)}")

        out_path = out_dir / filename
        out_path.write_text(result, encoding="utf-8")
        print(f"✅  {out_path}")


# ── CLI ───────────────────────────────────────────────────────────

def parse_args():
    p = argparse.ArgumentParser(
        description="Генератор файлов из шаблонов",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    p.add_argument("handler_name", nargs="?",
                   help="Имя хендлера, напр. OrderHandler")
    p.add_argument("--template", "-t", action="append", metavar="NAME",
                   help="Какие шаблоны применить (можно несколько). "
                        "По умолчанию — все. Пример: -t Handler -t Service")
    p.add_argument("--service-ns", default="shop::services", metavar="NS")
    p.add_argument("--out-dir", default=".", metavar="DIR")
    p.add_argument("--var", action="append", metavar="KEY=VALUE", default=[],
                   help="Доп. переменная. Пример: --var AUTHOR=ivan")
    p.add_argument("--list-templates", action="store_true",
                   help="Показать все шаблоны")
    p.add_argument("--list-vars", metavar="TEMPLATE",
                   help="Показать переменные шаблона")
    return p.parse_args()

def main():
    args = parse_args()

    if args.list_templates:
        cmd_list_templates()
        return

    if args.list_vars:
        cmd_list_vars(args.list_vars)
        return

    if not args.handler_name:
        print("Укажите имя или используйте --list-templates", file=sys.stderr)
        sys.exit(1)

    name = args.handler_name
    if not name[0].isupper():
        print(f"⚠️  Имя должно начинаться с заглавной буквы: {name}", file=sys.stderr)
        sys.exit(1)

    extra_vars = {}
    for item in args.var:
        if "=" not in item:
            print(f"⚠️  Неверный формат --var: '{item}' (нужно KEY=VALUE)", file=sys.stderr)
            sys.exit(1)
        k, v = item.split("=", 1)
        extra_vars[k.strip().upper()] = v.strip()

    cmd_generate(
        handler_name=name,
        service_ns=args.service_ns,
        out_dir=Path(args.out_dir),
        extra_vars=extra_vars,
        template_names=args.template,
    )

if __name__ == "__main__":
    main()
