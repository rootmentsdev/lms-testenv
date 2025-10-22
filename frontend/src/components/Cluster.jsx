import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';

const Cluster = () => {
  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card style={{ width: '100%' }}>
            <Card.Body>
              <Card.Title>Cluster of the Week</Card.Title>

              
              <Row className="mt-3">
                <Col md={6}>
                  <Card>
                    <Card.Body>
                      <Card.Title>South Cluster</Card.Title>
                      <Card.Link href="#">This Week</Card.Link>
                      <Card.Text>
                        75% completed — just 25% left to reach 100%, keep pushing!
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card>
                    <Card.Body>
                      <Card.Title>North Cluster</Card.Title>
                      <Card.Link href="#">This Week</Card.Link>
                      <Card.Text>
                        54% completed — 46% remaining to complete 100%.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cluster;
