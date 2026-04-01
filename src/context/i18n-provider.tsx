'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AppLocale } from '@/lib/i18n/types'

const LOCALE_STORAGE_KEY = 'app_locale'

const uiMessages = {
  vi: {
    language: {
      label: 'Đổi ngôn ngữ',
      vietnamese: 'Tiếng Việt',
      english: 'Tiếng Anh',
    },
    sidebar: {
      workspace: {
        teamName: 'Không gian quản trị',
        teamPlan: 'Next.js + shadcn/ui',
        general: 'Tổng quan',
        overview: 'Tổng quan',
        tasks: 'Công việc',
        apps: 'Ứng dụng',
        users: 'Người dùng',
        support: 'Hỗ trợ',
        helpCenter: 'Trung tâm trợ giúp',
        notifications: 'Thông báo',
        settings: 'Cài đặt',
        profile: 'Hồ sơ',
      },
      lemiex: {
        teamName: 'Không gian Lemiex',
        teamPlan: 'Sidebar theo vai trò',
        overview: 'Tổng quan',
        commerce: 'Thương mại',
        operations: 'Vận hành',
        supportTools: 'Công cụ hỗ trợ',
        administration: 'Quản trị',
        dashboard: 'Bảng điều khiển',
        welcome: 'Chào mừng',
        orders: 'Đơn hàng',
        designs: 'Thiết kế',
        products: 'Sản phẩm',
        catalog: 'Danh mục',
        productVariants: 'Biến thể sản phẩm',
        stores: 'Cửa hàng',
        tickets: 'Khiếu nại',
        stockManagement: 'Quản lý kho',
        stockDashboard: 'Tổng quan kho',
        manageStock: 'Quản lý tồn kho',
        productions: 'Sản xuất',
        shortageReport: 'Báo cáo thiếu hàng',
        shortageByVariant: 'Thiếu hàng theo biến thể',
        auditLogs: 'Lịch sử kiểm tra',
        hrPayroll: 'Nhân sự & lương',
        attendances: 'Chấm công',
        payrollReport: 'Báo cáo lương',
        salaryTiers: 'Bậc lương',
        embroideryProgress: 'Tiến độ thêu',
        trackings: 'Theo dõi đơn',
        videos: 'Video',
        wallets: 'Ví',
        transactions: 'Giao dịch',
        pendingFund: 'Tiền chờ duyệt',
        refunds: 'Hoàn tiền',
        surcharge: 'Phụ thu',
        debits: 'Công nợ',
        staffReport: 'Báo cáo nhân sự',
        systems: 'Hệ thống',
        users: 'Người dùng',
        permissions: 'Phân quyền',
        tiers: 'Tiers',
      },
    },
    command: {
      placeholder: 'Tìm màn hình hoặc thao tác...',
      empty: 'Không tìm thấy kết quả.',
      theme: 'Giao diện',
      light: 'Sáng',
      dark: 'Tối',
      system: 'Theo hệ thống',
    },
    profile: {
      manageProfile: 'Hồ sơ cá nhân',
      billing: 'Thanh toán',
      notifications: 'Thông báo',
      signOut: 'Đăng xuất',
      roleLabel: 'Vai trò',
      signOutTitle: 'Đăng xuất',
      signOutDesc:
        'Bạn có chắc muốn đăng xuất không? Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng tài khoản.',
      cancel: 'Hủy',
    },
    pagination: {
      rowsPerPage: 'Số dòng mỗi trang',
      pageOf: 'Trang {current} / {total}',
      goToFirstPage: 'Về trang đầu',
      goToPreviousPage: 'Về trang trước',
      goToPage: 'Tới trang {page}',
      goToNextPage: 'Tới trang sau',
      goToLastPage: 'Về trang cuối',
    },
    orders: {
      title: 'Đơn hàng',
      count: 'đơn hàng',
      refresh: 'Làm mới',
      embroidery: 'Thêu',
      print: 'In',
      loadErrorTitle: 'Không thể tải đơn hàng',
      empty: 'Không có đơn hàng phù hợp với bộ lọc hiện tại.',
      noOrderIds: 'Không có order ID nào khớp với bộ lọc hiện tại.',
      copiedOrderIds: 'Đã copy {count} order ID.',
      noTrackingNumbers: 'Không tìm thấy tracking cho các đơn đã chọn',
      copiedTrackingNumbers: 'Đã copy {count} tracking number(s)',
      copyTrackingFailed: 'Không thể copy mã tracking',
      selectAtLeastOneOrder: 'Vui lòng chọn ít nhất một đơn hàng',
      buyLabelFailed: 'Mua label thất bại',
      labelCreated: 'Tạo label thành công! Tracking: {tracking}',
      labelJobsDispatched:
        'Đã gửi {count} tác vụ tạo label thành công!',
      createOrder: 'Tạo đơn hàng',
      confirmBuyLabel: 'Xác nhận mua label',
      confirmBuyLabelDesc:
        'Bạn có chắc muốn mua shipping label cho {count} đơn hàng không?',
      confirmPurchase: 'Xác nhận mua',
      processing: 'Đang xử lý...',
      copyTracking: 'Sao chép tracking',
      buyLabel: 'Mua label',
      headers: {
        order: 'Đơn hàng',
        seller: 'Seller',
        ticket: 'Ticket',
        priority: 'Ưu tiên',
        embType: 'Loại thêu',
        fulfillStatus: 'Trạng thái xử lý',
        items: 'Sản phẩm',
        tracking: 'Tracking',
        printCost: 'Phí in',
        shipping: 'Ship',
        totalCost: 'Tổng chi phí',
        payment: 'Thanh toán',
        created: 'Ngày tạo',
        actions: 'Thao tác',
      },
      status: {
        unknown: 'Không xác định',
        noRefId: 'Không có ref ID',
        noVariant: 'Không có variant',
        hasTicket: 'Đã có ticket',
        normal: 'Bình thường',
        priority: 'Ưu tiên',
        noItems: 'Không có sản phẩm',
        itemCount: '{count} sản phẩm',
        noTracking: '-',
        label: 'Label',
        convert: 'Convert',
        na: 'N/A',
        unnamedItem: 'Sản phẩm chưa đặt tên',
        front: 'Front',
      },
      actions: {
        view: 'Xem',
        timeline: 'Timeline',
        edit: 'Sửa',
        support: 'Support',
        goToStores: 'Đi tới cửa hàng',
        ticketExistsTitle: 'Ticket đã tồn tại',
        ticketExistsDesc:
          'Đơn hàng này đã có một hoặc nhiều support ticket. Bạn muốn xem ticket hiện có hay tạo ticket mới?',
        viewExistingTickets: 'Xem ticket hiện có',
        createNewTicket: 'Tạo ticket mới',
        pending: 'Tính năng {label} sẽ được nối tiếp sau.',
        remakeDesign: 'Remake Des',
        remakeQr: 'Remake QR',
      },
      timelineModal: {
        title: 'Lịch sử đơn hàng',
        orderPrefix: 'Đơn hàng',
        loading: 'Đang tải timeline...',
        empty: 'Không tìm thấy sự kiện timeline',
        loadError: 'Không thể tải timeline',
        close: 'Đóng',
        columns: {
          action: 'Hành động',
          description: 'Mô tả',
          createdAt: 'Tạo lúc',
          updatedAt: 'Cập nhật lúc',
        },
      },
      detail: {
        backToOrders: 'Quay lại đơn hàng',
        loadingOrder: 'Đang tải chi tiết đơn hàng...',
        orderNotFound: 'Không tìm thấy đơn hàng',
        orderInfo: 'Thông tin đơn hàng',
        sellerInfo: 'Thông tin seller',
        shippingInfo: 'Thông tin vận chuyển',
        orderItems: 'Sản phẩm',
        pricing: 'Chi phí',
        actionsTitle: 'Thao tác',
        orderStt: 'Mã đơn',
        referenceId: 'Mã tham chiếu',
        sellerRef: 'Mã seller',
        paymentStatus: 'Trạng thái thanh toán',
        createdAt: 'Ngày tạo',
        username: 'Username',
        email: 'Email',
        tier: 'Tier',
        store: 'Cửa hàng',
        service: 'Đơn vị vận chuyển',
        method: 'Phương thức',
        trackingId: 'Mã tracking',
        address: 'Địa chỉ',
        shippingLabel: 'Shipping label',
        viewLabel: 'Xem label',
        convertLabel: 'Convert label',
        viewConvert: 'Xem convert',
        qrCodes: 'Mã QR',
        download: 'Tải xuống',
        downloadAll: 'Tải tất cả',
        downloadingAll: 'Đang tải...',
        downloadAllSuccess: 'Đã tải {success}/{total} mã QR',
        mergedImages: 'Ảnh ghép',
        quantity: 'Số lượng',
        printCost: 'Phí in',
        shippingCost: 'Phí ship',
        extraFee: 'Phụ phí',
        refundFee: 'Phí hoàn',
        totalCost: 'Tổng chi phí',
        profitMargin: 'Biên lợi nhuận',
        updatingLabel: 'Đang cập nhật label...',
        updateLabel: 'Cập nhật label',
        updateLabelSuccess: 'Cập nhật label thành công',
        updateLabelFailed: 'Cập nhật label thất bại',
        cancelOrder: 'Hủy đơn',
        sellerCancelConfirm:
          'Bạn có chắc muốn hủy đơn hàng #{id}? Hành động này không thể hoàn tác.',
        sellerCancelSuccess: 'Hủy đơn hàng thành công',
        sellerCancelFailed: 'Hủy đơn hàng thất bại',
        videos: 'Videos',
        noData: 'Không có dữ liệu',
      },
      createOrderDialog: {
        storeRequiredTitle: 'Cần có cửa hàng',
        storeRequiredDesc:
          'Bạn cần có ít nhất một cửa hàng trước khi tạo đơn hàng.',
        categoryTitle: 'Tạo đơn hàng mới',
        categoryDesc: 'Chọn nhóm sản phẩm để tiếp tục.',
        embroideryTitle: 'Thêu',
        embroideryDesc:
          'Áo thun, hoodie, sweatshirt với thiết kế thêu.',
        tumblerTitle: 'In cốc giữ nhiệt',
        tumblerDesc: 'Cốc giữ nhiệt và mug với thiết kế in.',
        typeTitle: 'Chọn loại đơn hàng',
        typeDescEmbroidery: 'Đơn hàng thêu',
        typeDescTumbler: 'Đơn hàng cốc giữ nhiệt',
        noDesignTitle: 'Không có thiết kế',
        noDesignDesc: 'Sản phẩm trơn không có file thiết kế.',
        labelShipTitle: 'Label Ship',
        labelShipDesc:
          'Đơn có file thiết kế và dùng nhãn vận chuyển TikTok.',
        sellerShipTitle: 'Seller Ship',
        sellerShipDesc:
          'Đơn có file thiết kế và địa chỉ nhận hàng.',
        tumblerLabelShipTitle: 'Tumbler Label Ship',
        tumblerLabelShipDesc:
          'Đơn cốc giữ nhiệt dùng nhãn vận chuyển TikTok.',
        tumblerSellerShipTitle: 'Tumbler Seller Ship',
        tumblerSellerShipDesc:
          'Đơn cốc giữ nhiệt dùng địa chỉ nhận hàng.',
      },
      createForm: {
        labelShipTitle: 'Tạo đơn hàng - Label Ship',
        labelShipSubtitle:
          'Tạo đơn thêu với URL label TikTok và đầy đủ tài nguyên thiết kế.',
        sellerShipTitle: 'Tạo đơn hàng - Seller Ship',
        sellerShipSubtitle:
          'Tạo đơn thêu với địa chỉ người nhận và đầy đủ tài nguyên thiết kế.',
        backToOrders: 'Quay lại đơn hàng',
        orderInformation: 'Thông tin đơn hàng',
        shippingInformation: 'Thông tin vận chuyển',
        shippingAddress: 'Địa chỉ nhận hàng',
        productsAndDesignFiles: 'Sản phẩm & file thiết kế',
        productsAndDesignFilesDesc:
          'Mỗi line item vẫn giữ nguyên payload legacy mà backend đang dùng.',
        orderReferenceId: 'Mã tham chiếu đơn hàng',
        storeApiKey: 'Cửa hàng / API Key',
        sellerReference: 'Mã tham chiếu seller',
        orderStatus: 'Trạng thái đơn hàng',
        shippingMethod: 'Phương thức vận chuyển',
        shippingService: 'Đơn vị vận chuyển',
        fulfillmentPriority: 'Độ ưu tiên xử lý',
        shippingLabelUrl: 'URL label vận chuyển TikTok',
        shippingLabelHint:
          'Luồng này có chi phí ship thấp hơn. Không cần nhập địa chỉ người nhận.',
        orderNotes: 'Ghi chú đơn hàng',
        recipientName: 'Tên người nhận',
        phoneNumber: 'Số điện thoại',
        streetAddress: 'Địa chỉ',
        apartmentSuite: 'Căn hộ, suite, v.v.',
        city: 'Thành phố',
        stateProvince: 'Bang / Tỉnh',
        zipCode: 'Mã ZIP / bưu chính',
        country: 'Quốc gia',
        productCardTitle: 'Sản phẩm #{index}',
        productCardDesc:
          'Biến thể, mockup và toàn bộ file thêu của sản phẩm này.',
        productVariant: 'Biến thể sản phẩm',
        variantId: 'Variant ID',
        quantity: 'Số lượng',
        productName: 'Tên sản phẩm',
        mockupFrontUrl: 'URL mockup mặt trước',
        mockupBackUrl: 'URL mockup mặt sau',
        mockupSleeveLeft: 'URL mockup tay trái',
        mockupSleeveRight: 'URL mockup tay phải',
        mockupPreview: 'Xem trước mockup',
        addFrontMockupUrl: 'Thêm URL mockup mặt trước',
        designFiles: 'File thiết kế',
        designFilesDesc:
          'Giữ nguyên file key và cấu trúc payload như hệ thống cũ.',
        addDesignSide: 'Thêm mặt thiết kế',
        designTitle: 'Thiết kế #{index}',
        position: 'Vị trí',
        embroideryType: 'Loại thêu',
        embFileUrl: 'URL file EMB',
        pesFileUrl: 'URL file PES',
        addProduct: 'Thêm sản phẩm',
        remove: 'Xóa',
        cancel: 'Hủy',
        createOrder: 'Tạo đơn hàng',
        creating: 'Đang tạo...',
        loadingStores: 'Đang tải cửa hàng...',
        selectedStore: 'Cửa hàng đã chọn: {name}',
        storesAvailable: '{count} cửa hàng khả dụng',
        noStoresFound: 'Không tìm thấy cửa hàng. Hãy nhập API key thủ công.',
        standardShippingMethod: 'standard',
        fixedUsps: 'USPS',
        optionLabels: {
          orderStatus: {
            new_order: 'Đơn mới',
            on_hold: 'Tạm giữ',
            confirm: 'Xác nhận',
            test_order: 'Đơn test',
          },
          shippingService: {
            USPS: 'USPS',
            UPS: 'UPS',
            FedEx: 'FedEx',
          },
          country: {
            US: 'Hoa Kỳ',
            CA: 'Canada',
            GB: 'Vương quốc Anh',
            AU: 'Úc',
            DE: 'Đức',
            FR: 'Pháp',
            JP: 'Nhật Bản',
            VN: 'Việt Nam',
          },
          designPosition: {
            front: 'Mặt trước',
            back: 'Mặt sau',
            sleeve_left: 'Tay trái',
            sleeve_right: 'Tay phải',
            neck: 'Cổ áo',
          },
          embroideryType: {
            standard: 'Tiêu chuẩn',
          },
        },
        productPicker: {
          product: 'Sản phẩm',
          color: 'Màu',
          size: 'Kích thước',
          loadingProducts: 'Đang tải sản phẩm...',
          selectProduct: 'Chọn sản phẩm',
          loadingColors: 'Đang tải màu...',
          selectColor: 'Chọn màu',
          loadingSizes: 'Đang tải size...',
          selectSize: 'Chọn size',
          resolvingVariant: 'Đang lấy variant...',
          variantId: 'Variant ID',
          chooseAll: 'Chọn sản phẩm, màu và kích thước để lấy variant',
        },
        upload: {
          upload: 'Upload',
          uploading: 'Đang upload...',
          uploadFailed: 'Upload thất bại',
          uploadImageOrPaste: 'Upload ảnh hoặc dán URL',
          previewAlt: 'Xem trước tệp',
        },
        placeholders: {
          orderRefId: 'vd. ORDER-12345',
          manualApiKey: 'Nhập API key thủ công',
          sellerRef: 'vd. SHOP-12345',
          selectStore: 'Chọn cửa hàng',
          selectStatus: 'Chọn trạng thái',
          selectShippingMethod: 'Chọn phương thức vận chuyển',
          selectShippingService: 'Chọn đơn vị vận chuyển',
          selectPriority: 'Chọn độ ưu tiên',
          shippingLabel:
            'https://open-fs.tiktokshops.us/label/12345.pdf',
          notes: 'Thêm ghi chú hoặc hướng dẫn xử lý',
          recipientName: 'Nguyen Van A',
          phone: '+84901234567',
          street1: '123 Main Street',
          street2: 'Apartment, suite, unit, building, floor',
          city: 'Ho Chi Minh City',
          state: 'NY',
          zip: '10001',
          selectCountry: 'Chọn quốc gia',
          variantId: 'Chọn sản phẩm, màu và size',
          productName: 'Tên sản phẩm hiển thị trong đơn',
          mockupFront: 'https://example.com/mockup-front.png',
          mockupBack: 'https://example.com/mockup-back.png',
          sleeveLeft: 'https://example.com/sleeve-left.png',
          sleeveRight: 'https://example.com/sleeve-right.png',
          selectPosition: 'Chọn vị trí',
          selectEmbroideryType: 'Chọn loại thêu',
          embFile: 'https://example.com/design.emb',
          pesFile: 'https://example.com/design.pes',
        },
        validation: {
          orderRefRequired: 'Mã tham chiếu đơn hàng là bắt buộc.',
          apiKeyRequired: 'Cửa hàng / API key là bắt buộc.',
          shippingLabelRequired: 'URL label vận chuyển là bắt buộc.',
          shippingAddressRequired: 'Vui lòng nhập đầy đủ địa chỉ giao hàng.',
          variantRequired: 'Mỗi sản phẩm phải có variant ID.',
          productNameRequired: 'Mỗi sản phẩm phải có tên sản phẩm.',
          mockupRequired: 'Mỗi sản phẩm phải có URL mockup mặt trước.',
          designFileRequired:
            'Mỗi sản phẩm phải có ít nhất một file thiết kế.',
        },
        submit: {
          successWithId: 'Tạo đơn hàng thành công. Order ID: {id}',
          success: 'Tạo đơn hàng thành công.',
          failed: 'Tạo đơn hàng thất bại',
        },
      },
      editForm: {
        title: 'Chỉnh sửa đơn hàng',
        reference: 'Mã tham chiếu',
        loading: 'Đang tải chi tiết đơn hàng...',
        loadingFailed: 'Không thể tải chi tiết đơn hàng',
        cannotEdit: 'Không thể chỉnh sửa',
        sellerBlockReason:
          'Seller chỉ có thể chỉnh sửa đơn ở trạng thái new_order hoặc on_hold. Trạng thái hiện tại: {status}',
        generalInformation: 'Thông tin chung',
        shippingDetails: 'Thông tin vận chuyển',
        addressInformation: 'Thông tin địa chỉ',
        orderItems: 'Sản phẩm',
        note: 'Ghi chú',
        shippingMethod: 'Phương thức vận chuyển',
        shippingService: 'Đơn vị vận chuyển',
        shippingLabelUrl: 'URL shipping label',
        addressLine1: 'Địa chỉ dòng 1',
        addressLine2: 'Địa chỉ dòng 2',
        fullName: 'Họ và tên',
        city: 'Thành phố',
        state: 'Bang / Tỉnh',
        zipCode: 'Mã ZIP / bưu chính',
        country: 'Quốc gia',
        phone: 'Số điện thoại',
        mockupImages: 'Ảnh mockup',
        frontViewUrl: 'URL ảnh mặt trước',
        backViewUrl: 'URL ảnh mặt sau',
        printFilesDesigns: 'Print files / Designs',
        addPosition: 'Thêm vị trí',
        noPrintFiles: 'Chưa có print file nào.',
        positionPlaceholder: 'Vị trí...',
        imageUrl: 'URL ảnh',
        pdfUrl: 'URL PDF',
        embUrl: 'URL EMB',
        pesUrl: 'URL PES',
        saveChanges: 'Lưu thay đổi',
        saving: 'Đang lưu...',
        saveSuccess: 'Cập nhật đơn hàng thành công',
        noChanges: 'Không có thay đổi nào',
        saveFailed: 'Cập nhật đơn hàng thất bại',
        viewFile: 'Xem file',
      },
      filters: {
        orderId: 'MÃ ĐƠN HÀNG',
        variantId: 'MÃ BIẾN THỂ',
        refId: 'MÃ THAM CHIẾU',
        trackingNumber: 'MÃ TRACKING',
        search: 'Tìm kiếm',
        clearAll: 'Xóa bộ lọc',
        getIds: 'Lấy IDs',
        filters: 'Bộ lọc',
        excludeStatus: 'LOẠI TRỪ TRẠNG THÁI',
        shippingInfo: 'THÔNG TIN SHIP',
        missingShippingInfo: 'Thiếu thông tin (Label/Tracking/Convert)',
        fulfillStatus: 'TRẠNG THÁI XỬ LÝ',
        paymentStatus: 'TRẠNG THÁI THANH TOÁN',
        productAttributes: 'THUỘC TÍNH SẢN PHẨM',
        style: 'KIỂU',
        color: 'MÀU',
        size: 'KÍCH THƯỚC',
        seller: 'NGƯỜI BÁN',
        embType: 'LOẠI THÊU',
        productName: 'TÊN SẢN PHẨM',
        dateFrom: 'TỪ NGÀY',
        dateTo: 'ĐẾN NGÀY',
        sortBy: 'SẮP XẾP THEO',
        sortOrder: 'THỨ TỰ SẮP XẾP',
        placeholders: {
          orderId: 'vd. 59 58 80',
          variantId: 'Mã biến thể',
          refId: 'Mã tham chiếu',
          trackingNumber: 'Mã tracking',
          selectStyle: 'Chọn style',
          selectColor: 'Chọn màu',
          selectSize: 'Chọn size',
          allSellers: 'Tất cả seller',
          allTypes: 'Tất cả loại',
          productName: 'Tên sản phẩm',
          createdDate: 'Ngày tạo',
          ascending: 'Tăng dần',
        },
        selectStyle: 'Chọn style',
        selectColor: 'Chọn màu',
        selectSize: 'Chọn size',
        allSellers: 'Tất cả seller',
        allTypes: 'Tất cả loại',
      },
      paymentStatuses: {
        pending: 'Chờ thanh toán',
        paid: 'Đã thanh toán',
        partial_refund: 'Hoàn tiền một phần',
        refunded: 'Đã hoàn tiền',
        failed: 'Thất bại',
      },
      fulfillStatuses: {
        new_order: 'Đơn mới',
        confirm: 'Xác nhận',
        pending_stock: 'Chờ hàng',
        in_stock: 'Có hàng',
        producing: 'Đang sản xuất',
        qc_pass: 'QC đạt',
        packed: 'Đã đóng gói',
        shipped: 'Đã giao',
        on_hold: 'Tạm giữ',
        return_to_support: 'Trả về support',
        cancelled: 'Đã hủy',
        cancelled_refund_shipping: 'Đã hủy (hoàn ship)',
        closed: 'Đã đóng',
        test_order: 'Đơn test',
      },
      sortBy: {
        created_at: 'Ngày tạo',
        updated_at: 'Ngày cập nhật',
        id: 'Order ID',
        ref_id: 'Reference ID',
      },
      sortOrder: {
        asc: 'Tăng dần',
        desc: 'Giảm dần',
      },
    },
    productVariants: {
      title: 'Biến thể sản phẩm',
      count: 'sản phẩm',
      loading: 'Đang tải sản phẩm...',
      loadError: 'Không thể tải danh sách sản phẩm',
      empty: 'Không có sản phẩm nào khớp với bộ lọc hiện tại.',
      tabs: {
        embroidery: 'Thêu',
        print: 'In',
      },
      columns: {
        product: 'Sản phẩm',
        colors: 'Màu',
        sizes: 'Kích thước',
        variants: 'Variants',
        totalStock: 'Tồn kho',
        priceRange: 'Khoảng giá',
        status: 'Trạng thái',
        actions: 'Thao tác',
      },
      filters: {
        search: 'Tìm kiếm',
        searchPlaceholder: 'Tìm theo tên, brand, style...',
        style: 'Style',
        stylePlaceholder: 'Lọc theo style...',
        brand: 'Brand',
        brandPlaceholder: 'Lọc theo brand...',
        status: 'Trạng thái',
        allStatus: 'Tất cả trạng thái',
        sortBy: 'Sắp xếp',
        newestFirst: 'Mới nhất trước',
        oldestFirst: 'Cũ nhất trước',
        nameAz: 'Tên (A-Z)',
        nameZa: 'Tên (Z-A)',
        brandAz: 'Brand (A-Z)',
        brandZa: 'Brand (Z-A)',
        clearFilters: 'Xóa bộ lọc',
      },
      status: {
        noBrand: 'Chưa có brand',
        noStyle: 'Chưa có style',
        noColors: 'Không có màu',
        noSizes: 'Không có size',
        active: 'đang hoạt động',
        activeLabel: 'Hoạt động',
        inactiveLabel: 'Tạm tắt',
        na: 'N/A',
        to: 'đến',
      },
      actions: {
        importCsv: 'Import CSV',
        createProduct: 'Tạo sản phẩm',
        importPending: 'Flow import CSV sẽ được nối tiếp sau.',
        stock: 'Stock',
        view: 'Xem',
        delete: 'Xóa',
        confirmDelete: 'Bạn có chắc muốn xóa sản phẩm "{name}"?',
        deleteSuccess: 'Đã xóa sản phẩm thành công',
        deleteFailed: 'Xóa sản phẩm thất bại',
        deletePending: 'Flow xóa sản phẩm "{name}" sẽ được nối tiếp sau.',
      },
      importDialog: {
        title: 'Import sản phẩm từ CSV',
        description: 'Upload file CSV, xem trước dữ liệu rồi import vào hệ thống.',
        downloadTemplate: 'Tải template',
        downloadCurrentData: 'Tải dữ liệu hiện tại',
        clickToSelect: 'Bấm để chọn file CSV',
        orDragDrop: 'hoặc kéo thả vào đây',
        selectCsvFile: 'Vui lòng chọn file CSV',
        preview: 'Xem trước',
        previewFailed: 'Không thể xem trước file CSV',
        import: 'Import',
        importSuccess: 'Import sản phẩm thành công',
        importFailed: 'Import sản phẩm thất bại',
        products: 'Sản phẩm',
        newProducts: 'Sản phẩm mới',
        existingProducts: 'Sản phẩm cập nhật',
        newTag: 'MỚI',
        updateTag: 'CẬP NHẬT',
        imported: 'Đã import',
        failed: 'Lỗi',
        errors: 'Danh sách lỗi',
        done: 'Hoàn tất',
      },
      stockDialog: {
        title: 'Cập nhật tồn kho',
        description: 'Điều chỉnh tồn kho cho biến thể sản phẩm.',
        addStock: 'Thêm kho',
        subtractStock: 'Trừ kho',
        color: 'Màu',
        size: 'Kích thước',
        quantity: 'Số lượng',
        quantityPlaceholder: 'Nhập số lượng',
        selectColor: 'Chọn màu',
        selectSize: 'Chọn size',
        validation: 'Vui lòng nhập đầy đủ thông tin tồn kho hợp lệ.',
        updating: 'Đang cập nhật...',
        updateFailed: 'Cập nhật tồn kho thất bại',
        addSuccess: 'Đã thêm tồn kho thành công',
        subtractSuccess: 'Đã trừ tồn kho thành công',
      },
      detail: {
        loading: 'Đang tải chi tiết sản phẩm...',
        loadError: 'Không thể tải chi tiết sản phẩm',
        notFound: 'Không tìm thấy sản phẩm',
        back: 'Quay lại biến thể sản phẩm',
        active: 'Hoạt động',
        inactive: 'Tạm tắt',
        brand: 'Brand',
        style: 'Style',
        warehouse: 'Kho',
        category: 'Danh mục',
        print: 'In',
        embroidery: 'Thêu',
        created: 'Ngày tạo',
        updated: 'Cập nhật',
        editProduct: 'Chỉnh sửa sản phẩm',
        totalVariants: 'Tổng biến thể',
        totalStock: 'Tổng tồn kho',
        priceRange: 'Khoảng giá',
        colors: 'Màu',
        sizes: 'Kích thước',
        variantsTitle: 'Danh sách biến thể',
        variantsCount: 'biến thể',
        noData: 'N/A',
        save: 'Lưu',
        cancel: 'Hủy',
        edit: 'Sửa',
        delete: 'Xóa',
        confirmDeleteVariant: 'Bạn có chắc muốn xóa biến thể {id}?',
        deleteVariantSuccess: 'Đã xóa biến thể thành công',
        deleteVariantFailed: 'Xóa biến thể thất bại',
        deletePending: 'Luồng xóa biến thể {id} sẽ được nối tiếp sau.',
        variantUpdated: 'Cập nhật biến thể thành công',
        updateFailed: 'Cập nhật biến thể thất bại',
        pricingSaved: 'Cập nhật bảng giá thành công',
        viewPricing: 'Xem giá',
        setPricing: 'Thiết lập giá',
        pricing: {
          title: 'Bảng giá theo tier',
          noVariant: 'Chưa chọn biến thể',
          readOnly: 'Chỉ xem',
          production: 'Chi phí sản xuất',
          shipping: 'Chi phí vận chuyển',
          type: 'Loại giá',
          close: 'Đóng',
          cancel: 'Hủy',
          saving: 'Đang lưu...',
          save: 'Lưu thay đổi',
          failed: 'Cập nhật bảng giá thất bại',
        },
        columns: {
          variantId: 'Variant ID',
          color: 'Màu',
          size: 'Kích thước',
          stock: 'Tồn kho',
          supplierPrice: 'Giá NCC',
          tierPricing: 'Bảng giá',
          weight: 'Khối lượng',
          dimensions: 'Kích thước',
          status: 'Trạng thái',
          actions: 'Thao tác',
        },
      },
      createForm: {
        title: 'Tạo sản phẩm',
        description: 'Tạo sản phẩm mới và khai báo biến thể cùng bảng giá.',
        productInfo: 'Thông tin sản phẩm',
        variants: 'Biến thể',
        pricing: 'Bảng giá',
        productName: 'Tên sản phẩm',
        style: 'Style',
        brand: 'Brand',
        warehouse: 'Kho',
        productNamePlaceholder: 'vd. Unisex Heavy Cotton Tee',
        stylePlaceholder: 'vd. G5000',
        brandPlaceholder: 'vd. Gildan',
        warehousePlaceholder: 'vd. Main Warehouse',
        mockupUrl: 'Mockup URL',
        category: 'Danh mục',
        status: 'Trạng thái',
        active: 'Hoạt động',
        inactive: 'Tạm tắt',
        addVariant: 'Thêm biến thể',
        noVariantsYet: 'Chưa có biến thể nào. Hãy bấm thêm biến thể để bắt đầu.',
        variant: 'Biến thể',
        removeVariant: 'Xóa biến thể',
        variantId: 'Variant ID',
        variantIdPlaceholder: 'vd. G5000-BLK-S',
        sku: 'SKU',
        skuPlaceholder: 'vd. SKU-G5000-BLK-S',
        color: 'Màu',
        colorPlaceholder: 'vd. Black',
        size: 'Kích thước',
        sizePlaceholder: 'vd. S',
        stock: 'Tồn kho',
        supplierPrice: 'Giá NCC',
        weight: 'Khối lượng (g)',
        dimensions: 'Kích thước (D x R x C)',
        addPrice: 'Thêm giá',
        noPricesAdded: 'Chưa có giá nào',
        tier: 'Tier',
        priceType: 'Loại giá',
        price: 'Giá',
        cancel: 'Hủy',
        create: 'Tạo sản phẩm',
        creating: 'Đang tạo...',
        productNameRequired: 'Tên sản phẩm là bắt buộc',
        variantIdRequired: 'Variant ID là bắt buộc',
        createSuccess: 'Tạo sản phẩm thành công',
        createFailed: 'Tạo sản phẩm thất bại',
      },
    },
  },
  en: {
    language: {
      label: 'Change language',
      vietnamese: 'Vietnamese',
      english: 'English',
    },
    sidebar: {
      workspace: {
        teamName: 'Admin Workspace',
        teamPlan: 'Next.js + shadcn/ui',
        general: 'General',
        overview: 'Overview',
        tasks: 'Tasks',
        apps: 'Apps',
        users: 'Users',
        support: 'Support',
        helpCenter: 'Help Center',
        notifications: 'Notifications',
        settings: 'Settings',
        profile: 'Profile',
      },
      lemiex: {
        teamName: 'Lemiex Workspace',
        teamPlan: 'Role-aware sidebar',
        overview: 'Overview',
        commerce: 'Commerce',
        operations: 'Operations',
        supportTools: 'Support Tools',
        administration: 'Administration',
        dashboard: 'Dashboard',
        welcome: 'Welcome',
        orders: 'Orders',
        designs: 'Designs',
        products: 'Products',
        catalog: 'Catalog',
        productVariants: 'Product Variants',
        stores: 'Stores',
        tickets: 'Tickets',
        stockManagement: 'Stock Management',
        stockDashboard: 'Dashboard',
        manageStock: 'Manage Stock',
        productions: 'Productions',
        shortageReport: 'Shortage Report',
        shortageByVariant: 'Shortage by Variant',
        auditLogs: 'Audit Logs',
        hrPayroll: 'HR & Payroll',
        attendances: 'Attendances',
        payrollReport: 'Payroll Report',
        salaryTiers: 'Salary Tiers',
        embroideryProgress: 'Embroidery Progress',
        trackings: 'Trackings',
        videos: 'Videos',
        wallets: 'Wallets',
        transactions: 'Transactions',
        pendingFund: 'Pending Fund',
        refunds: 'Refunds',
        surcharge: 'Surcharge',
        debits: 'Debits',
        staffReport: 'Staff Report',
        systems: 'Systems',
        users: 'Users',
        permissions: 'Permissions',
        tiers: 'Tiers',
      },
    },
    command: {
      placeholder: 'Search screens or actions...',
      empty: 'No results found.',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    profile: {
      manageProfile: 'Profile',
      billing: 'Billing',
      notifications: 'Notifications',
      signOut: 'Sign out',
      roleLabel: 'Role',
      signOutTitle: 'Sign out',
      signOutDesc:
        'Are you sure you want to sign out? You will need to sign in again to access your account.',
      cancel: 'Cancel',
    },
    pagination: {
      rowsPerPage: 'Rows per page',
      pageOf: 'Page {current} of {total}',
      goToFirstPage: 'Go to first page',
      goToPreviousPage: 'Go to previous page',
      goToPage: 'Go to page {page}',
      goToNextPage: 'Go to next page',
      goToLastPage: 'Go to last page',
    },
    orders: {
      title: 'Orders',
      count: 'orders',
      refresh: 'Refresh',
      embroidery: 'Embroidery',
      print: 'Print',
      loadErrorTitle: 'Unable to load orders',
      empty: 'No orders found for the current filters.',
      noOrderIds: 'No order IDs match the current filters.',
      copiedOrderIds: 'Copied {count} order ID(s).',
      noTrackingNumbers: 'No tracking numbers found for selected orders',
      copiedTrackingNumbers: 'Copied {count} tracking number(s)',
      copyTrackingFailed: 'Failed to copy tracking numbers',
      selectAtLeastOneOrder: 'Please select at least one order',
      buyLabelFailed: 'Failed to buy label',
      labelCreated: 'Label created successfully! Tracking: {tracking}',
      labelJobsDispatched:
        '{count} label jobs dispatched successfully!',
      createOrder: 'Create Order',
      confirmBuyLabel: 'Confirm Buy Label',
      confirmBuyLabelDesc:
        'Are you sure you want to buy shipping labels for {count} order(s)?',
      confirmPurchase: 'Confirm Purchase',
      processing: 'Processing...',
      copyTracking: 'Copy Tracking',
      buyLabel: 'Buy Label',
      headers: {
        order: 'Order',
        seller: 'Seller',
        ticket: 'Ticket',
        priority: 'Priority',
        embType: 'Emb Type',
        fulfillStatus: 'Fulfill Status',
        items: 'Items',
        tracking: 'Tracking',
        printCost: 'Print Cost',
        shipping: 'Shipping',
        totalCost: 'Total Cost',
        payment: 'Payment',
        created: 'Created',
        actions: 'Actions',
      },
      status: {
        unknown: 'Unknown',
        noRefId: 'No ref ID',
        noVariant: 'No variant',
        hasTicket: 'Has ticket',
        normal: 'Normal',
        priority: 'Priority',
        noItems: 'No items',
        itemCount: '{count} item(s)',
        noTracking: '-',
        label: 'Label',
        convert: 'Convert',
        na: 'N/A',
        unnamedItem: 'Unnamed item',
        front: 'Front',
      },
      actions: {
        view: 'View',
        timeline: 'Timeline',
        edit: 'Edit',
        support: 'Support',
        goToStores: 'Go to Stores',
        ticketExistsTitle: 'Ticket Already Exists',
        ticketExistsDesc:
          'This order already has one or more support tickets. Would you like to view existing tickets or create a new one?',
        viewExistingTickets: 'View Existing Tickets',
        createNewTicket: 'Create New Ticket',
        pending: '{label} action will be wired next.',
        remakeDesign: 'Remake Des',
        remakeQr: 'Remake QR',
      },
      timelineModal: {
        title: 'Order Timeline',
        orderPrefix: 'Order',
        loading: 'Loading timeline...',
        empty: 'No timeline events found',
        loadError: 'Failed to load timeline',
        close: 'Close',
        columns: {
          action: 'Action',
          description: 'Description',
          createdAt: 'Created At',
          updatedAt: 'Updated At',
        },
      },
      detail: {
        backToOrders: 'Back to Orders',
        loadingOrder: 'Loading order details...',
        orderNotFound: 'Order not found',
        orderInfo: 'Order Information',
        sellerInfo: 'Seller Information',
        shippingInfo: 'Shipping Information',
        orderItems: 'Items',
        pricing: 'Pricing',
        actionsTitle: 'Actions',
        orderStt: 'Order',
        referenceId: 'Reference ID',
        sellerRef: 'Seller Ref',
        paymentStatus: 'Payment Status',
        createdAt: 'Created At',
        username: 'Username',
        email: 'Email',
        tier: 'Tier',
        store: 'Store',
        service: 'Service',
        method: 'Method',
        trackingId: 'Tracking ID',
        address: 'Address',
        shippingLabel: 'Shipping Label',
        viewLabel: 'View Label',
        convertLabel: 'Convert Label',
        viewConvert: 'View Convert',
        qrCodes: 'QR Codes',
        download: 'Download',
        downloadAll: 'Download All',
        downloadingAll: 'Downloading...',
        downloadAllSuccess: 'Downloaded {success}/{total} QR codes',
        mergedImages: 'Merged Images',
        quantity: 'Quantity',
        printCost: 'Print Cost',
        shippingCost: 'Shipping Cost',
        extraFee: 'Extra Fee',
        refundFee: 'Refund Fee',
        totalCost: 'Total Cost',
        profitMargin: 'Profit Margin',
        updatingLabel: 'Updating label...',
        updateLabel: 'Update Label',
        updateLabelSuccess: 'Label updated successfully',
        updateLabelFailed: 'Failed to update label',
        cancelOrder: 'Cancel Order',
        sellerCancelConfirm:
          'Are you sure you want to cancel order #{id}? This action cannot be undone.',
        sellerCancelSuccess: 'Order cancelled successfully',
        sellerCancelFailed: 'Failed to cancel order',
        videos: 'Videos',
        noData: 'No data',
      },
      createOrderDialog: {
        storeRequiredTitle: 'Store required',
        storeRequiredDesc:
          'You need at least one store before creating an order.',
        categoryTitle: 'Create New Order',
        categoryDesc: 'Select product category to continue.',
        embroideryTitle: 'Embroidery',
        embroideryDesc:
          'T-Shirts, Hoodies, Sweatshirts with embroidered designs.',
        tumblerTitle: 'Tumbler Print',
        tumblerDesc: 'Tumblers and mugs with printed designs.',
        typeTitle: 'Select Order Type',
        typeDescEmbroidery: 'Embroidery',
        typeDescTumbler: 'Tumbler',
        noDesignTitle: 'No Design',
        noDesignDesc: 'Blank products without any design file.',
        labelShipTitle: 'Label Ship',
        labelShipDesc:
          'Orders with design files and TikTok shipping labels.',
        sellerShipTitle: 'Seller Ship',
        sellerShipDesc:
          'Orders with design files and shipping address.',
        tumblerLabelShipTitle: 'Tumbler Label Ship',
        tumblerLabelShipDesc:
          'Tumbler orders with TikTok shipping labels.',
        tumblerSellerShipTitle: 'Tumbler Seller Ship',
        tumblerSellerShipDesc:
          'Tumbler orders with shipping address.',
      },
      createForm: {
        labelShipTitle: 'Create Order - Label Ship',
        labelShipSubtitle:
          'Create embroidery orders with TikTok shipping label URLs and complete design assets.',
        sellerShipTitle: 'Create Order - Seller Ship',
        sellerShipSubtitle:
          'Create embroidery orders with seller shipping address and full design package.',
        backToOrders: 'Back to Orders',
        orderInformation: 'Order Information',
        shippingInformation: 'Shipping Information',
        shippingAddress: 'Shipping Address',
        productsAndDesignFiles: 'Products & Design Files',
        productsAndDesignFilesDesc:
          'Each line item keeps the legacy payload shape used by the existing backend.',
        orderReferenceId: 'Order Reference ID',
        storeApiKey: 'Store / API Key',
        sellerReference: 'Seller Reference',
        orderStatus: 'Order Status',
        shippingMethod: 'Shipping Method',
        shippingService: 'Shipping Service',
        fulfillmentPriority: 'Fulfillment Priority',
        shippingLabelUrl: 'TikTok Shipping Label URL',
        shippingLabelHint:
          'This flow has lower shipping cost. Recipient address is not required.',
        orderNotes: 'Order Notes',
        recipientName: 'Recipient Name',
        phoneNumber: 'Phone Number',
        streetAddress: 'Street Address',
        apartmentSuite: 'Apartment, suite, etc.',
        city: 'City',
        stateProvince: 'State / Province',
        zipCode: 'ZIP / Postal Code',
        country: 'Country',
        productCardTitle: 'Product #{index}',
        productCardDesc:
          'Variant, mockups and all embroidery files for this item.',
        productVariant: 'Product Variant',
        variantId: 'Variant ID',
        quantity: 'Quantity',
        productName: 'Product Name',
        mockupFrontUrl: 'Mockup Front URL',
        mockupBackUrl: 'Mockup Back URL',
        mockupSleeveLeft: 'Mockup Sleeve Left',
        mockupSleeveRight: 'Mockup Sleeve Right',
        mockupPreview: 'Mockup Preview',
        addFrontMockupUrl: 'Add a front mockup URL',
        designFiles: 'Design Files',
        designFilesDesc:
          'Keep the same file keys and payload structure as the legacy system.',
        addDesignSide: 'Add Design Side',
        designTitle: 'Design #{index}',
        position: 'Position',
        embroideryType: 'Embroidery Type',
        embFileUrl: 'EMB File URL',
        pesFileUrl: 'PES File URL',
        addProduct: 'Add Product',
        remove: 'Remove',
        cancel: 'Cancel',
        createOrder: 'Create Order',
        creating: 'Creating...',
        loadingStores: 'Loading stores...',
        selectedStore: 'Selected store: {name}',
        storesAvailable: '{count} store(s) available',
        noStoresFound: 'No stores found. Enter API key manually.',
        standardShippingMethod: 'standard',
        fixedUsps: 'USPS',
        optionLabels: {
          orderStatus: {
            new_order: 'New Order',
            on_hold: 'On Hold',
            confirm: 'Confirm',
            test_order: 'Test Order',
          },
          shippingService: {
            USPS: 'USPS',
            UPS: 'UPS',
            FedEx: 'FedEx',
          },
          country: {
            US: 'United States',
            CA: 'Canada',
            GB: 'United Kingdom',
            AU: 'Australia',
            DE: 'Germany',
            FR: 'France',
            JP: 'Japan',
            VN: 'Vietnam',
          },
          designPosition: {
            front: 'Front',
            back: 'Back',
            sleeve_left: 'Sleeve Left',
            sleeve_right: 'Sleeve Right',
            neck: 'Neck',
          },
          embroideryType: {
            standard: 'Standard',
          },
        },
        productPicker: {
          product: 'Product',
          color: 'Color',
          size: 'Size',
          loadingProducts: 'Loading products...',
          selectProduct: 'Select product',
          loadingColors: 'Loading colors...',
          selectColor: 'Select color',
          loadingSizes: 'Loading sizes...',
          selectSize: 'Select size',
          resolvingVariant: 'Resolving variant...',
          variantId: 'Variant ID',
          chooseAll: 'Choose product, color, and size to resolve a variant',
        },
        upload: {
          upload: 'Upload',
          uploading: 'Uploading...',
          uploadFailed: 'Upload failed',
          uploadImageOrPaste: 'Upload image or paste URL',
          previewAlt: 'File preview',
        },
        placeholders: {
          orderRefId: 'e.g. ORDER-12345',
          manualApiKey: 'Enter API key manually',
          sellerRef: 'e.g. SHOP-12345',
          selectStore: 'Select a store',
          selectStatus: 'Select status',
          selectShippingMethod: 'Select shipping method',
          selectShippingService: 'Select shipping service',
          selectPriority: 'Select priority',
          shippingLabel:
            'https://open-fs.tiktokshops.us/label/12345.pdf',
          notes: 'Add special instructions or handling notes',
          recipientName: 'John Doe',
          phone: '+1234567890',
          street1: '123 Main Street',
          street2: 'Apartment, suite, unit, building, floor',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          selectCountry: 'Select country',
          variantId: 'Select product, color and size',
          productName: 'Product name shown in the order',
          mockupFront: 'https://example.com/mockup-front.png',
          mockupBack: 'https://example.com/mockup-back.png',
          sleeveLeft: 'https://example.com/sleeve-left.png',
          sleeveRight: 'https://example.com/sleeve-right.png',
          selectPosition: 'Select position',
          selectEmbroideryType: 'Select embroidery type',
          embFile: 'https://example.com/design.emb',
          pesFile: 'https://example.com/design.pes',
        },
        validation: {
          orderRefRequired: 'Order reference ID is required.',
          apiKeyRequired: 'Store / API key is required.',
          shippingLabelRequired: 'Shipping label URL is required.',
          shippingAddressRequired: 'Please complete the shipping address.',
          variantRequired: 'Each product must have a variant ID.',
          productNameRequired: 'Each product must have a product name.',
          mockupRequired: 'Each product must have a front mockup URL.',
          designFileRequired:
            'Each product must include at least one design file.',
        },
        submit: {
          successWithId: 'Order created successfully. Order ID: {id}',
          success: 'Order created successfully.',
          failed: 'Failed to create order',
        },
      },
      editForm: {
        title: 'Edit Order',
        reference: 'Reference',
        loading: 'Loading order details...',
        loadingFailed: 'Failed to load order details',
        cannotEdit: 'Cannot Edit',
        sellerBlockReason:
          'Seller can only edit orders with status: new_order or on_hold. Current: {status}',
        generalInformation: 'General Information',
        shippingDetails: 'Shipping Details',
        addressInformation: 'Address Information',
        orderItems: 'Order Items',
        note: 'Note',
        shippingMethod: 'Shipping Method',
        shippingService: 'Shipping Service',
        shippingLabelUrl: 'Shipping Label URL',
        addressLine1: 'Address Line 1',
        addressLine2: 'Address Line 2',
        fullName: 'Full Name',
        city: 'City',
        state: 'State / Province',
        zipCode: 'Zip / Postal Code',
        country: 'Country',
        phone: 'Phone',
        mockupImages: 'Mockup Images',
        frontViewUrl: 'Front View URL',
        backViewUrl: 'Back View URL',
        printFilesDesigns: 'Print Files / Designs',
        addPosition: 'Add Position',
        noPrintFiles: 'No print files added.',
        positionPlaceholder: 'Position...',
        imageUrl: 'Image URL',
        pdfUrl: 'PDF URL',
        embUrl: 'EMB URL',
        pesUrl: 'PES URL',
        saveChanges: 'Save Changes',
        saving: 'Saving...',
        saveSuccess: 'Order updated successfully',
        noChanges: 'No changes detected.',
        saveFailed: 'Failed to update order',
        viewFile: 'View file',
      },
      filters: {
        orderId: 'ORDER ID',
        variantId: 'VARIANT ID',
        refId: 'REF ID',
        trackingNumber: 'TRACKING NUMBER',
        search: 'Search',
        clearAll: 'Clear All',
        getIds: 'Get IDs',
        filters: 'Filters',
        excludeStatus: 'EXCLUDE STATUS',
        shippingInfo: 'SHIPPING INFO',
        missingShippingInfo: 'Missing Info (Label/Tracking/Convert)',
        fulfillStatus: 'FULFILL STATUS',
        paymentStatus: 'PAYMENT STATUS',
        productAttributes: 'PRODUCT ATTRIBUTES',
        style: 'STYLE',
        color: 'COLOR',
        size: 'SIZE',
        seller: 'SELLER',
        embType: 'EMB TYPE',
        productName: 'PRODUCT NAME',
        dateFrom: 'DATE FROM',
        dateTo: 'DATE TO',
        sortBy: 'SORT BY',
        sortOrder: 'SORT ORDER',
        placeholders: {
          orderId: 'e.g. 59 58 80',
          variantId: 'Variant ID',
          refId: 'Reference ID',
          trackingNumber: 'Tracking #',
          selectStyle: 'Select Style',
          selectColor: 'Select Color',
          selectSize: 'Select Size',
          allSellers: 'All Sellers',
          allTypes: 'All Types',
          productName: 'Product Name',
          createdDate: 'Created Date',
          ascending: 'Ascending',
        },
        selectStyle: 'Select Style',
        selectColor: 'Select Color',
        selectSize: 'Select Size',
        allSellers: 'All Sellers',
        allTypes: 'All Types',
      },
      paymentStatuses: {
        pending: 'Pending',
        paid: 'Paid',
        partial_refund: 'Partial Refund',
        refunded: 'Refunded',
        failed: 'Failed',
      },
      fulfillStatuses: {
        new_order: 'New Order',
        confirm: 'Confirm',
        pending_stock: 'Pending Stock',
        in_stock: 'In Stock',
        producing: 'Producing',
        qc_pass: 'QC Pass',
        packed: 'Packed',
        shipped: 'Shipped',
        on_hold: 'On Hold',
        return_to_support: 'Return To Support',
        cancelled: 'Cancelled',
        cancelled_refund_shipping: 'Cancelled (Refund Shipping)',
        closed: 'Closed',
        test_order: 'Test Order',
      },
      sortBy: {
        created_at: 'Created At',
        updated_at: 'Updated At',
        id: 'Order ID',
        ref_id: 'Reference ID',
      },
      sortOrder: {
        asc: 'Ascending',
        desc: 'Descending',
      },
    },
    productVariants: {
      title: 'Product Variants',
      count: 'products',
      loading: 'Loading products...',
      loadError: 'Unable to load products',
      empty: 'No products match the current filters.',
      tabs: {
        embroidery: 'Embroidery',
        print: 'Print',
      },
      columns: {
        product: 'Product',
        colors: 'Colors',
        sizes: 'Sizes',
        variants: 'Variants',
        totalStock: 'Total Stock',
        priceRange: 'Price Range',
        status: 'Status',
        actions: 'Actions',
      },
      filters: {
        search: 'Search',
        searchPlaceholder: 'Search by name, brand, style...',
        style: 'Style',
        stylePlaceholder: 'Filter by style...',
        brand: 'Brand',
        brandPlaceholder: 'Filter by brand...',
        status: 'Status',
        allStatus: 'All Status',
        sortBy: 'Sort By',
        newestFirst: 'Newest First',
        oldestFirst: 'Oldest First',
        nameAz: 'Name (A-Z)',
        nameZa: 'Name (Z-A)',
        brandAz: 'Brand (A-Z)',
        brandZa: 'Brand (Z-A)',
        clearFilters: 'Clear Filters',
      },
      status: {
        noBrand: 'No brand',
        noStyle: 'No style',
        noColors: 'No colors',
        noSizes: 'No sizes',
        active: 'active',
        activeLabel: 'Active',
        inactiveLabel: 'Inactive',
        na: 'N/A',
        to: 'to',
      },
      actions: {
        importCsv: 'Import CSV',
        createProduct: 'Create Product',
        importPending: 'CSV import flow will be connected next.',
        stock: 'Stock',
        view: 'View',
        delete: 'Delete',
        confirmDelete: 'Are you sure you want to delete product "{name}"?',
        deleteSuccess: 'Product deleted successfully',
        deleteFailed: 'Failed to delete product',
        deletePending: 'Delete flow for "{name}" will be connected next.',
      },
      importDialog: {
        title: 'Import products from CSV',
        description: 'Upload a CSV file, preview the data, then import it.',
        downloadTemplate: 'Download template',
        downloadCurrentData: 'Download current data',
        clickToSelect: 'Click to select a CSV file',
        orDragDrop: 'or drag and drop it here',
        selectCsvFile: 'Please select a CSV file',
        preview: 'Preview',
        previewFailed: 'Failed to preview CSV',
        import: 'Import',
        importSuccess: 'Products imported successfully',
        importFailed: 'Failed to import products',
        products: 'Products',
        newProducts: 'New products',
        existingProducts: 'Existing products',
        newTag: 'NEW',
        updateTag: 'UPDATE',
        imported: 'Imported',
        failed: 'Failed',
        errors: 'Errors',
        done: 'Done',
      },
      stockDialog: {
        title: 'Update Stock',
        description: 'Adjust inventory for a product variant.',
        addStock: 'Add Stock',
        subtractStock: 'Subtract Stock',
        color: 'Color',
        size: 'Size',
        quantity: 'Quantity',
        quantityPlaceholder: 'Enter quantity',
        selectColor: 'Select color',
        selectSize: 'Select size',
        validation: 'Please provide valid stock information.',
        updating: 'Updating...',
        updateFailed: 'Failed to update stock',
        addSuccess: 'Stock added successfully',
        subtractSuccess: 'Stock subtracted successfully',
      },
      detail: {
        loading: 'Loading product details...',
        loadError: 'Failed to load product details',
        notFound: 'Product not found',
        back: 'Back to Product Variants',
        active: 'Active',
        inactive: 'Inactive',
        brand: 'Brand',
        style: 'Style',
        warehouse: 'Warehouse',
        category: 'Category',
        print: 'Print',
        embroidery: 'Embroidery',
        created: 'Created',
        updated: 'Updated',
        editProduct: 'Edit Product',
        totalVariants: 'Total Variants',
        totalStock: 'Total Stock',
        priceRange: 'Price Range',
        colors: 'Colors',
        sizes: 'Sizes',
        variantsTitle: 'Variants',
        variantsCount: 'variants',
        noData: 'N/A',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        confirmDeleteVariant: 'Are you sure you want to delete variant {id}?',
        deleteVariantSuccess: 'Variant deleted successfully',
        deleteVariantFailed: 'Failed to delete variant',
        deletePending: 'Delete flow for variant {id} will be connected next.',
        variantUpdated: 'Variant updated successfully',
        updateFailed: 'Failed to update variant',
        pricingSaved: 'Tier pricing updated successfully',
        viewPricing: 'View Pricing',
        setPricing: 'Set Pricing',
        pricing: {
          title: 'Tier Pricing',
          noVariant: 'No variant selected',
          readOnly: 'Read only',
          production: 'Production Costs',
          shipping: 'Shipping Costs',
          type: 'Type',
          close: 'Close',
          cancel: 'Cancel',
          saving: 'Saving...',
          save: 'Save Changes',
          failed: 'Failed to update tier pricing',
        },
        columns: {
          variantId: 'Variant ID',
          color: 'Color',
          size: 'Size',
          stock: 'Stock',
          supplierPrice: 'Supplier Price',
          tierPricing: 'Tier Pricing',
          weight: 'Weight',
          dimensions: 'Dimensions',
          status: 'Status',
          actions: 'Actions',
        },
      },
      createForm: {
        title: 'Create Product',
        description: 'Create a new product with variants and pricing.',
        productInfo: 'Product Information',
        variants: 'Variants',
        pricing: 'Pricing',
        productName: 'Product Name',
        style: 'Style',
        brand: 'Brand',
        warehouse: 'Warehouse',
        productNamePlaceholder: 'e.g., Unisex Heavy Cotton Tee',
        stylePlaceholder: 'e.g., G5000',
        brandPlaceholder: 'e.g., Gildan',
        warehousePlaceholder: 'e.g., Main Warehouse',
        mockupUrl: 'Mockup URL',
        category: 'Category',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        addVariant: 'Add Variant',
        noVariantsYet: 'No variants added yet. Click add variant to begin.',
        variant: 'Variant',
        removeVariant: 'Remove variant',
        variantId: 'Variant ID',
        variantIdPlaceholder: 'e.g., G5000-BLK-S',
        sku: 'SKU',
        skuPlaceholder: 'e.g., SKU-G5000-BLK-S',
        color: 'Color',
        colorPlaceholder: 'e.g., Black',
        size: 'Size',
        sizePlaceholder: 'e.g., S',
        stock: 'Stock',
        supplierPrice: 'Supplier Price',
        weight: 'Weight (g)',
        dimensions: 'Dimensions (L x W x H)',
        addPrice: 'Add Price',
        noPricesAdded: 'No prices added',
        tier: 'Tier',
        priceType: 'Price Type',
        price: 'Price',
        cancel: 'Cancel',
        create: 'Create Product',
        creating: 'Creating...',
        productNameRequired: 'Product name is required',
        variantIdRequired: 'Variant ID is required',
        createSuccess: 'Product created successfully',
        createFailed: 'Failed to create product',
      },
    },
  },
} satisfies Record<AppLocale, {
  language: {
    label: string
    vietnamese: string
    english: string
  }
  sidebar: {
    workspace: {
      teamName: string
      teamPlan: string
      general: string
      overview: string
      tasks: string
      apps: string
      users: string
      support: string
      helpCenter: string
      notifications: string
      settings: string
      profile: string
    }
    lemiex: {
      teamName: string
      teamPlan: string
      overview: string
      commerce: string
      operations: string
      supportTools: string
      administration: string
      dashboard: string
      welcome: string
      orders: string
      designs: string
      products: string
      catalog: string
      productVariants: string
      stores: string
      tickets: string
      stockManagement: string
      stockDashboard: string
      manageStock: string
      productions: string
      shortageReport: string
      shortageByVariant: string
      auditLogs: string
      hrPayroll: string
      attendances: string
      payrollReport: string
      salaryTiers: string
      embroideryProgress: string
      trackings: string
      videos: string
      wallets: string
      transactions: string
      pendingFund: string
      refunds: string
      surcharge: string
      debits: string
      staffReport: string
      systems: string
      users: string
      permissions: string
      tiers: string
    }
  }
  command: {
    placeholder: string
    empty: string
    theme: string
    light: string
    dark: string
    system: string
  }
  profile: {
    manageProfile: string
    billing: string
    notifications: string
    signOut: string
    roleLabel: string
    signOutTitle: string
    signOutDesc: string
    cancel: string
  }
  pagination: {
    rowsPerPage: string
    pageOf: string
    goToFirstPage: string
    goToPreviousPage: string
    goToPage: string
    goToNextPage: string
    goToLastPage: string
  }
  orders: {
    title: string
    count: string
    refresh: string
    embroidery: string
    print: string
    loadErrorTitle: string
    empty: string
    noOrderIds: string
    copiedOrderIds: string
    noTrackingNumbers: string
    copiedTrackingNumbers: string
    copyTrackingFailed: string
    selectAtLeastOneOrder: string
    buyLabelFailed: string
    labelCreated: string
    labelJobsDispatched: string
    confirmBuyLabel: string
    confirmBuyLabelDesc: string
    confirmPurchase: string
    processing: string
    copyTracking: string
    buyLabel: string
    headers: {
      order: string
      seller: string
      ticket: string
      priority: string
      embType: string
      fulfillStatus: string
      items: string
      tracking: string
      printCost: string
      shipping: string
      totalCost: string
      payment: string
      created: string
      actions: string
    }
    status: {
      unknown: string
      noRefId: string
      noVariant: string
      hasTicket: string
      normal: string
      priority: string
      noItems: string
      itemCount: string
      noTracking: string
      label: string
      convert: string
      na: string
      unnamedItem: string
      front: string
    }
    actions: {
      view: string
      timeline: string
      edit: string
      support: string
      goToStores: string
      ticketExistsTitle: string
      ticketExistsDesc: string
      viewExistingTickets: string
      createNewTicket: string
      pending: string
      remakeDesign: string
      remakeQr: string
    }
    timelineModal: {
      title: string
      orderPrefix: string
      loading: string
      empty: string
      loadError: string
      close: string
      columns: {
        action: string
        description: string
        createdAt: string
        updatedAt: string
      }
    }
    detail: {
      backToOrders: string
      loadingOrder: string
      orderNotFound: string
      orderInfo: string
      sellerInfo: string
      shippingInfo: string
      orderItems: string
      pricing: string
      actionsTitle: string
      orderStt: string
      referenceId: string
      sellerRef: string
      paymentStatus: string
      createdAt: string
      username: string
      email: string
      tier: string
      store: string
      service: string
      method: string
      trackingId: string
      address: string
      shippingLabel: string
      viewLabel: string
      convertLabel: string
      viewConvert: string
      qrCodes: string
      download: string
      downloadAll: string
      downloadingAll: string
      downloadAllSuccess: string
      mergedImages: string
      quantity: string
      printCost: string
      shippingCost: string
      extraFee: string
      refundFee: string
      totalCost: string
      profitMargin: string
      updatingLabel: string
      updateLabel: string
      updateLabelSuccess: string
      updateLabelFailed: string
      cancelOrder: string
      sellerCancelConfirm: string
      sellerCancelSuccess: string
      sellerCancelFailed: string
      videos: string
      noData: string
    }
    createForm: {
      labelShipTitle: string
      labelShipSubtitle: string
      sellerShipTitle: string
      sellerShipSubtitle: string
      backToOrders: string
      orderInformation: string
      shippingInformation: string
      shippingAddress: string
      productsAndDesignFiles: string
      productsAndDesignFilesDesc: string
      orderReferenceId: string
      storeApiKey: string
      sellerReference: string
      orderStatus: string
      shippingMethod: string
      shippingService: string
      fulfillmentPriority: string
      shippingLabelUrl: string
      shippingLabelHint: string
      orderNotes: string
      recipientName: string
      phoneNumber: string
      streetAddress: string
      apartmentSuite: string
      city: string
      stateProvince: string
      zipCode: string
      country: string
      productCardTitle: string
      productCardDesc: string
      productVariant: string
      variantId: string
      quantity: string
      productName: string
      mockupFrontUrl: string
      mockupBackUrl: string
      mockupSleeveLeft: string
      mockupSleeveRight: string
      mockupPreview: string
      addFrontMockupUrl: string
      designFiles: string
      designFilesDesc: string
      addDesignSide: string
      designTitle: string
      position: string
      embroideryType: string
      embFileUrl: string
      pesFileUrl: string
      addProduct: string
      remove: string
      cancel: string
      createOrder: string
      creating: string
      loadingStores: string
      selectedStore: string
      storesAvailable: string
      noStoresFound: string
      standardShippingMethod: string
      fixedUsps: string
      optionLabels: {
        orderStatus: {
          new_order: string
          on_hold: string
          confirm: string
          test_order: string
        }
        shippingService: {
          USPS: string
          UPS: string
          FedEx: string
        }
        country: {
          US: string
          CA: string
          GB: string
          AU: string
          DE: string
          FR: string
          JP: string
          VN: string
        }
        designPosition: {
          front: string
          back: string
          sleeve_left: string
          sleeve_right: string
          neck: string
        }
        embroideryType: {
          standard: string
        }
      }
      productPicker: {
        product: string
        color: string
        size: string
        loadingProducts: string
        selectProduct: string
        loadingColors: string
        selectColor: string
        loadingSizes: string
        selectSize: string
        resolvingVariant: string
        variantId: string
        chooseAll: string
      }
      upload: {
        upload: string
        uploading: string
        uploadFailed: string
        uploadImageOrPaste: string
        previewAlt: string
      }
      placeholders: {
        orderRefId: string
        manualApiKey: string
        sellerRef: string
        selectStore: string
        selectStatus: string
        selectShippingMethod: string
        selectShippingService: string
        selectPriority: string
        shippingLabel: string
        notes: string
        recipientName: string
        phone: string
        street1: string
        street2: string
        city: string
        state: string
        zip: string
        selectCountry: string
        variantId: string
        productName: string
        mockupFront: string
        mockupBack: string
        sleeveLeft: string
        sleeveRight: string
        selectPosition: string
        selectEmbroideryType: string
        embFile: string
        pesFile: string
      }
      validation: {
        orderRefRequired: string
        apiKeyRequired: string
        shippingLabelRequired: string
        shippingAddressRequired: string
        variantRequired: string
        productNameRequired: string
        mockupRequired: string
        designFileRequired: string
      }
      submit: {
        successWithId: string
        success: string
        failed: string
      }
    }
    editForm: {
      title: string
      reference: string
      loading: string
      loadingFailed: string
      cannotEdit: string
      sellerBlockReason: string
      generalInformation: string
      shippingDetails: string
      addressInformation: string
      orderItems: string
      note: string
      shippingMethod: string
      shippingService: string
      shippingLabelUrl: string
      addressLine1: string
      addressLine2: string
      fullName: string
      city: string
      state: string
      zipCode: string
      country: string
      phone: string
      mockupImages: string
      frontViewUrl: string
      backViewUrl: string
      printFilesDesigns: string
      addPosition: string
      noPrintFiles: string
      positionPlaceholder: string
      imageUrl: string
      pdfUrl: string
      embUrl: string
      pesUrl: string
      saveChanges: string
      saving: string
      saveSuccess: string
      noChanges: string
      saveFailed: string
      viewFile: string
    }
    filters: {
      orderId: string
      variantId: string
      refId: string
      trackingNumber: string
      search: string
      clearAll: string
      getIds: string
      filters: string
      excludeStatus: string
      shippingInfo: string
      missingShippingInfo: string
      fulfillStatus: string
      paymentStatus: string
      productAttributes: string
      style: string
      color: string
      size: string
      seller: string
      embType: string
      productName: string
      dateFrom: string
      dateTo: string
      sortBy: string
      sortOrder: string
      placeholders: {
        orderId: string
        variantId: string
        refId: string
        trackingNumber: string
        selectStyle: string
        selectColor: string
        selectSize: string
        allSellers: string
        allTypes: string
        productName: string
        createdDate: string
        ascending: string
      }
      selectStyle: string
      selectColor: string
      selectSize: string
      allSellers: string
      allTypes: string
    }
    paymentStatuses: {
      pending: string
      paid: string
      partial_refund: string
      refunded: string
      failed: string
    }
    fulfillStatuses: {
      new_order: string
      confirm: string
      pending_stock: string
      in_stock: string
      producing: string
      qc_pass: string
      packed: string
      shipped: string
      on_hold: string
      return_to_support: string
      cancelled: string
      cancelled_refund_shipping: string
      closed: string
      test_order: string
    }
    sortBy: {
      created_at: string
      updated_at: string
      id: string
      ref_id: string
    }
    sortOrder: {
      asc: string
      desc: string
    }
  }
  productVariants: {
    title: string
    count: string
    loading: string
    loadError: string
    empty: string
    tabs: {
      embroidery: string
      print: string
    }
    columns: {
      product: string
      colors: string
      sizes: string
      variants: string
      totalStock: string
      priceRange: string
      status: string
      actions: string
    }
    filters: {
      search: string
      searchPlaceholder: string
      style: string
      stylePlaceholder: string
      brand: string
      brandPlaceholder: string
      status: string
      allStatus: string
      sortBy: string
      newestFirst: string
      oldestFirst: string
      nameAz: string
      nameZa: string
      brandAz: string
      brandZa: string
      clearFilters: string
    }
    status: {
      noBrand: string
      noStyle: string
      noColors: string
      noSizes: string
      active: string
      activeLabel: string
      inactiveLabel: string
      na: string
      to: string
    }
    actions: {
      importCsv: string
      createProduct: string
      importPending: string
      stock: string
      view: string
      delete: string
      confirmDelete: string
      deleteSuccess: string
      deleteFailed: string
      deletePending: string
    }
    importDialog: {
      title: string
      description: string
      downloadTemplate: string
      downloadCurrentData: string
      clickToSelect: string
      orDragDrop: string
      selectCsvFile: string
      preview: string
      previewFailed: string
      import: string
      importSuccess: string
      importFailed: string
      products: string
      newProducts: string
      existingProducts: string
      newTag: string
      updateTag: string
      imported: string
      failed: string
      errors: string
      done: string
    }
    stockDialog: {
      title: string
      description: string
      addStock: string
      subtractStock: string
      color: string
      size: string
      quantity: string
      quantityPlaceholder: string
      selectColor: string
      selectSize: string
      validation: string
      updating: string
      updateFailed: string
      addSuccess: string
      subtractSuccess: string
    }
    detail: {
      loading: string
      loadError: string
      notFound: string
      back: string
      active: string
      inactive: string
      brand: string
      style: string
      warehouse: string
      category: string
      print: string
      embroidery: string
      created: string
      updated: string
      editProduct: string
      totalVariants: string
      totalStock: string
      priceRange: string
      colors: string
      sizes: string
      variantsTitle: string
      variantsCount: string
      noData: string
      save: string
      cancel: string
      edit: string
      delete: string
      confirmDeleteVariant: string
      deleteVariantSuccess: string
      deleteVariantFailed: string
      deletePending: string
      variantUpdated: string
      updateFailed: string
      pricingSaved: string
      viewPricing: string
      setPricing: string
      pricing: {
        title: string
        noVariant: string
        readOnly: string
        production: string
        shipping: string
        type: string
        close: string
        cancel: string
        saving: string
        save: string
        failed: string
      }
      columns: {
        variantId: string
        color: string
        size: string
        stock: string
        supplierPrice: string
        tierPricing: string
        weight: string
        dimensions: string
        status: string
        actions: string
      }
    }
    createForm: {
      title: string
      description: string
      productInfo: string
      variants: string
      pricing: string
      productName: string
      style: string
      brand: string
      warehouse: string
      productNamePlaceholder: string
      stylePlaceholder: string
      brandPlaceholder: string
      warehousePlaceholder: string
      mockupUrl: string
      category: string
      status: string
      active: string
      inactive: string
      addVariant: string
      noVariantsYet: string
      variant: string
      removeVariant: string
      variantId: string
      variantIdPlaceholder: string
      sku: string
      skuPlaceholder: string
      color: string
      colorPlaceholder: string
      size: string
      sizePlaceholder: string
      stock: string
      supplierPrice: string
      weight: string
      dimensions: string
      addPrice: string
      noPricesAdded: string
      tier: string
      priceType: string
      price: string
      cancel: string
      create: string
      creating: string
      productNameRequired: string
      variantIdRequired: string
      createSuccess: string
      createFailed: string
    }
  }
}>

type I18nContextType = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  messages: (typeof uiMessages)[AppLocale]
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('vi')

  useEffect(() => {
    queueMicrotask(() => {
      const savedLocale = window.localStorage.getItem(
        LOCALE_STORAGE_KEY
      ) as AppLocale | null

      if (savedLocale === 'vi' || savedLocale === 'en') {
        setLocaleState(savedLocale)
        return
      }

      const browserLocale = navigator.language.toLowerCase()
      if (browserLocale.startsWith('en')) {
        setLocaleState('en')
      }
    })
  }, [])

  const setLocale = (nextLocale: AppLocale) => {
    setLocaleState(nextLocale)
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
  }

  const value = useMemo<I18nContextType>(
    () => ({
      locale,
      setLocale,
      messages: uiMessages[locale],
    }),
    [locale]
  )

  return <I18nContext value={value}>{children}</I18nContext>
}

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }

  return context
}
