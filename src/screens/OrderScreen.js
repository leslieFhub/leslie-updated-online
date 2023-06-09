import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./../components/Header";
import { PayPalButton } from "react-paypal-button-v2";
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetails, payOrder } from "../Redux/Actions/OrderActions";
import Loading from "./../components/LoadingError/Loading";
import Message from "./../components/LoadingError/Error";
import moment from "moment";
import axios from "axios";
import { ORDER_PAY_RESET } from "../Redux/Constants/OrderConstants";

const OrderScreen = ({ match }) => {
  window.scrollTo(0, 0);
  const [sdkReady, setSdkReady] = useState(false);
  const orderId = match.params.id;
  const dispatch = useDispatch();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;
  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;

  if (!loading) {
    const addDecimals = (num) => {
      return (Math.round(num * 100) / 100).toFixed(2);
    };

    order.itemsPrice = addDecimals(
      order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    );
  }

  useEffect(() => {
    const addPayPalScript = async () => {
      const { data: clientId } = await axios.get("https://leslies-server.onrender.com/api/config/paypal");
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };
      document.body.appendChild(script);
    };
    if (!order || successPay) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch(getOrderDetails(orderId));
    } else if (!order.isPaid) {
      if (!window.paypal) {
        addPayPalScript();
      } else {
        setSdkReady(true);
      }
    }
  }, [dispatch, orderId, successPay, order]);

  const successPaymentHandler = (paymentResult) => {
    dispatch(payOrder(orderId, paymentResult));
  };

  return (
    <>
      <Header />
      <div className="container">
        {loading ? (
          <Loading />
        ) : error ? (
          <Message variant="alert-danger">{error}</Message>
        ) : (
          <>
            <div className="row  order-detail">
              <div className="col-lg-4 col-sm-4 mb-lg-4 mb-5 mb-sm-0">
                <div className="row">
                  <div className="col-md-4 center">
                    <div className="alert-success order-box">
                      <i className="fas fa-user"></i>
                    </div>
                  </div>
                  <div className="col-md-8 center">
                    <h5>
                      <strong>Customer</strong>
                    </h5>
                    <p>{order.user.name}</p>
                    <p>
                      <a href={`mailto:${order.user.email}`}>
                        {order.user.email}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              {/* 2 */}
              <div className="col-lg-4 col-sm-4 mb-lg-4 mb-5 mb-sm-0">
                <div className="row">
                  <div className="col-md-4 center">
                    <div className="alert-success order-box">
                      <i className="fas fa-truck-moving"></i>
                    </div>
                  </div>
                  <div className="col-md-8 center">
                    <h5>
                      <strong>Order info</strong>
                    </h5>
                    <p><b>Shipping: </b>{order.shippingAddress.city}</p>
                    <p><b>Pay method: </b>{order.paymentMethod}</p>
                    {order.isPaid ? (
                      <div className="bg-info p-2 col-12">
                        <p className="text-white text-center text-sm-start">
                          Paid on {moment(order.paidAt).calendar()}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-danger p-2 col-12">
                        <p className="text-white text-center text-sm-start">
                          Not Paid
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* 3 */}
              <div className="col-lg-4 col-sm-4 mb-lg-4 mb-5 mb-sm-0">
                <div className="row">
                  <div className="col-md-4 center">
                    <div className="alert-success order-box">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                  </div>
                  <div className="col-md-8 center">
                    <h5>
                      <strong>Deliver to</strong>
                    </h5>
                    <p>
                      <b>Address:</b>  {order.shippingAddress.address},{" "}
                      {order.shippingAddress.postalCode}
                      
                    </p>
                    {order.isDelivered ? (
                      <div className="bg-info p-2 col-12">
                        <p className="text-white text-center text-sm-start">
                          Delivered on {moment(order.deliveredAt).calendar()}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-danger p-2 col-12">
                        <p className="text-white text-center text-sm-start">
                          Not Delivered
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {order.paymentMethod === "CashOnDelivery" ? (
              <div className="row order-products justify-content-between">
                <div className="col-lg-8">
                  {order.orderItems.length === 0 ? (
                    <Message variant="alert-info mt-5">
                      Your order is empty
                    </Message>
                  ) : (
                    <>
                      {order.orderItems.map((item, index) => (
                        <div className="order-product row" key={index}>
                          <div className="col-md-3 col-6">
                            <img src={item.image} alt={item.name} />
                          </div>
                          <div className="col-md-5 col-6 d-flex align-items-center">
                            <Link to={`/products/${item.product}`}>
                              <h6><b>{item.name}</b></h6>
                            </Link>
                          </div>
                          <div className="mt-3 mt-md-0 col-md-2 col-6  d-flex align-items-center flex-column justify-content-center ">
                            <h4>QUANTITY</h4>
                            <h6>{item.qty}</h6>
                          </div>
                          <div className="mt-3 mt-md-0 col-md-2 col-6 align-items-end  d-flex flex-column justify-content-center ">
                            <h4>SUBTOTAL</h4>
                            <h6><b>Php {item.price * item.qty}</b></h6>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <div className="col-lg-4 order-summary">
                  <h4>Order Summary</h4>
                  <hr />
                  <div className="row">
                    <div className="col-md-6">
                      <h6><b>Items</b></h6>
                    </div>
                    <div className="col-md-6">
                      <h6>{order.orderItems.length}</h6>
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-md-6">
                      <h6><b>Shipping</b></h6>
                    </div>
                    <div className="col-md-6">
                      <h6>Php {order.shippingPrice.toFixed(2)}</h6>
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-md-6">
                      <h6><b>Total</b></h6>
                    </div>
                    <div className="col-md-6">
                      <h6>Php {order.totalPrice.toFixed(2)}</h6>
                    </div>
                  </div>
                  <hr />
                </div>
              </div>
            ) : (
              <>
                <div className="row order-products">
                  <div className="col-lg-12">
                    {order.orderItems.length === 0 ? (
                      <Message variant="alert-info mt-5">
                        Your order is empty
                      </Message>
                    ) : (
                      <>
                        {order.orderItems.map((item, index) => (
                          <div className="order-product row" key={index}>
                            <div className="col-md-3 col-6">
                              <img src={item.image} alt={item.name} />
                            </div>
                            <div className="col-md-5 col-6 d-flex align-items-center">
                              <Link to={`/products/${item.product}`}>
                                <h6><b>{item.name}</b></h6>
                              </Link>
                            </div>
                            <div className="mt-3 mt-md-0 col-md-2 col-6  d-flex align-items-center flex-column justify-content-center ">
                              <h4>QUANTITY</h4>
                              <h6>{item.qty}</h6>
                            </div>
                            <div className="mt-3 mt-md-0 col-md-2 col-6 align-items-end  d-flex flex-column justify-content-center ">
                              <h4>SUBTOTAL</h4>
                              <h6><b>Php {item.price * item.qty}</b></h6>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
                <div className="row order-summary">
                  <div className="col-md-8">
                    <h4><b></b></h4>
                    <hr />
                    <div className="row">
                      <div className="col-md-6">
                        <h6><b>Items</b></h6>
                      </div>
                      <div className="col-md-6">
                        <h6>{order.orderItems.length}</h6>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-6">
                        <h6><b>Shipping</b></h6>
                      </div>
                      <div className="col-md-6">
                        <h6>Php {order.shippingPrice.toFixed(2)}</h6>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-6">
                        <h6><b>Total</b></h6>
                      </div>
                      <div className="col-md-6">
                        <h6><b>Php {order.totalPrice.toFixed(2)}</b></h6>
                      </div>
                    </div>
                    <hr />
                  </div>
                  <div className="col-md-4">
                    <h4><b>Payment Method</b></h4>
                    <hr />
                    {loadingPay && <Loading />}
                    {!sdkReady ? <p>Thank you for your purchase!</p> : (
                      <>
                        <p>
                          <strong>Method:</strong>{" "}
                          {order.paymentMethod === "PayPal" ? (
                            <span>PayPal</span>
                          ) : (
                            <span>Cash on Delivery</span>
                          )}
                        </p>
                        {order.paymentMethod === "PayPal" ? (
                          <>
                            {!order.isPaid && (
                              <PayPalButton
                                amount={order.totalPrice}
                                onSuccess={successPaymentHandler}
                              />
                            )}
                          </>
                        ) : (
                          <div className="alert alert-info">
                            Please keep exact change ready for the delivery
                          </div>
                        )}
                      </>
                    )}
                  </div>

                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default OrderScreen;
