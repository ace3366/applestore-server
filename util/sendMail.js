const Mailjet = require("node-mailjet");

const mailjet = Mailjet.apiConnect(
  "5708f2c3e434f8bd78bde4a5da6fb684",
  "a94a529f7604cf2efbf2cef741a2570a"
);

exports.sendEmail = async (order) => {
  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "poohmandu22@gmail.com",
            Name: "APPLE STORE",
          },
          To: [
            {
              Email: order.email,
              Name: order.fullName,
            },
          ],
          Subject: "Đơn hàng của bạn",
          HTMLPart: `
                            <h3>Hello, ${order.fullName}</h3>
                           <p>Phone : ${order.phone}</p>
                           <p>Address : ${order.address}</p>
                            
                            <table border="1" style="width:100%">
                                <tr>
                                    <th>Tên sản phẩm</th>
                                    <th>Hình ảnh</th>
                                    <th>Giá</th>
                                    <th>Số lượng</th>
                                    <th>Thành tiền</th>
                                </tr>
                                ${order.cart.products.map((product) => {
                                  return `<tr>
                                  <td>${product.productId.name}</td>
                                  <td> <img src="${product.productId.img1}" width="100" height="100"/></td>
                                  <td>${product.productId.price} VND</td>
                                  <td>${product.quantity}</td>
                                  <td>${product.productTotalPrice} VND</td>

                              </tr>`;
                                })}
                                
                            </table>
                            <h3>Tổng thanh toán</h3>
                            <h3> ${order.cart.totalPrice} VND</h3>
                            <h3>Cám ơn bạn.</h3>
                        `,
        },
      ],
    });
    console.log(request.body);
  } catch (err) {
    console.error(err.statusCode);
    console.error(err.message);
  }
};
