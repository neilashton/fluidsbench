import importlib.util
import os


def load_handler(name):
    """Load a Lambda handler module by function name ('fetch' or 'submit').

    Uses spec_from_file_location to avoid the `lambda` keyword collision
    that would break a normal import statement.
    Env vars TABLE_NAME and TRACES_BUCKET must be set before calling this,
    because the handlers execute boto3 calls at module level.
    """
    path = os.path.join(
        os.path.dirname(__file__), '..', 'lambda', name, 'handler.py'
    )
    spec = importlib.util.spec_from_file_location(f'{name}_handler', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod
