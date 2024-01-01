# test_app.py
import pytest
from server import app


@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


def test_hello_world(client):
    response = client.get('/')
    assert 200 == response.status_code
