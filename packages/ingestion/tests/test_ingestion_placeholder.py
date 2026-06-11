"""Placeholder until ingestion implementation begins (Week 1-2).

Keeps pytest collection non-empty so CI exercises the test pipeline.
Replace with parser-eval tests when docs/ingestion-eval.md is implemented.
"""


def test_python_version_floor() -> None:
    import sys

    assert sys.version_info >= (3, 11)
