import React, { useState } from "react";
import { Card, Container, Row, Col, Dropdown } from "react-bootstrap";

const Cluster = () => {
  const [selectedDate, setSelectedDate] = useState("21-10-2025");

  return (
    <Container className="mt-5"
    style={{
      height:"390px",
      width:"800px",
    }}
    >
      <Row sty className="justify-content-center ">
        <Col md={10}>
          <Card className="shadow-sm p-3 rounded-4 border-0">
            <Card.Body>
              {/* Header Section */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Card.Title
                  style={{ fontWeight: "600", fontSize: "1.25rem" }}
                >
                  Cluster of the Week
                </Card.Title>

                {/* Date Dropdown */}
                <Dropdown>
                  <Dropdown.Toggle
                    variant="light"
                    id="dropdown-basic"
                    className="border rounded-3 px-3 py-2"
                    style={{
                      fontWeight: "500",
                      backgroundColor: "#fff",
                      boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                    }}
                  >
                    19 / {selectedDate}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setSelectedDate("21-10-2025")}>
                      21-10-2025
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setSelectedDate("14-10-2025")}>
                      14-10-2025
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setSelectedDate("07-10-2025")}>
                      07-10-2025
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              {/* Cluster Cards */}
              <Row className="mt-4">
                <Col md={6}>
                  <Card
                    className="border-2 p-3"
                    style={{
                      borderColor: "#26d07c",
                      borderRadius: "15px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      height: "160px",
                      width: "280px",
                      marginTop:"-20px",
                    }}
                  >
                    <Card.Body>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Card.Title style={{ fontWeight: "900" ,fontSize:"15px"}}>
                         South Cluster
                        </Card.Title>
                        <span
                          style={{
                            backgroundColor: "#e9f9f0",
                            color: "#26d07c",
                            padding: "5px 10px",
                            borderRadius: "10px",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                            marginLeft:"5px"
                          }}
                        >
                          +32% this week
                        </span>
                      </div>

                      <div style={{ marginTop: "10px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                          }}
                        >
                         
                          <Card.Text style={{ fontSize: "0.9rem" }}>
                            77% completed — just 23% more to hit 100%! Keep
                            pushing!
                          </Card.Text>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card
                    className="border-2 p-3"
                    style={{
                      borderColor: "#b0b0b0",
                      borderRadius: "15px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      height: "160px",
                      width: "280px",
                       marginTop:"-20px",
                    }}
                  >
                    <Card.Body>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Card.Title style={{ fontWeight: "900", fontSize:"15px" }}>
                          North Cluster
                        </Card.Title>
                        <span
                          style={{
                            backgroundColor: "#eaf5ff",
                            color: "#1a8cff",
                            padding: "5px 10px",
                            borderRadius: "10px",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                          }}
                        >
                          +14% this week
                        </span>
                      </div>

                      <div style={{ marginTop: "10px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                          }}
                        >
                        
                          <Card.Text style={{ fontSize: "0.9rem" }}>
                            54% completed — 46% more to reach the goal. Keep the
                            momentum going!
                          </Card.Text>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
            <button  style={{
              background:"#f39393c6",
              color:"#d12c2cc6",
              fontWeight:"700",
              fontSize:"20px",
              padding:"5px 5px",
              borderRadius:"8px",
              width:"95%",
              marginLeft:"16px",
            }}>
              Clear 8 Overdue Training
            </button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cluster;
