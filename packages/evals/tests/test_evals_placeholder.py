"""Placeholder until eval harness implementation (Weeks 7-8).

First real tests: gold-set YAML schema validation per
docs/eval-methodology.md §3.5.
"""


def test_gold_dir_exists() -> None:
    from pathlib import Path

    assert Path(__file__).parents[3].joinpath("data", "gold").is_dir()
